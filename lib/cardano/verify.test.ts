import { describe, it, expect } from 'vitest'
import { encode } from 'cbor-x'
import crypto from 'crypto'
import { CML } from '@lucid-evolution/lucid'
import { verifyWalletSignature } from './verify'

const NONCE = 'test-nonce-123'

function keyHashOf(rawPub: Buffer) {
  return CML.PublicKey.from_bytes(new Uint8Array(rawPub)).hash().to_hex()
}

/**
 * Builds a signature in the exact shape a CIP-30 wallet produces: the connector
 * calls signData with the *reward* address, so the wallet signs with the stake
 * key and returns a COSE_Sign1 + COSE_Key pair.
 */
function signAsWallet(message: string) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')
  const rawPub = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32)

  const stakeKeyHash = keyHashOf(rawPub)
  const paymentKeyHash = crypto.randomBytes(28).toString('hex')

  const address = CML.BaseAddress.new(
    1,
    CML.Credential.new_pub_key(CML.Ed25519KeyHash.from_hex(paymentKeyHash)),
    CML.Credential.new_pub_key(CML.Ed25519KeyHash.from_hex(stakeKeyHash))
  )
    .to_address()
    .to_bech32()

  const rewardAddress = CML.RewardAddress.new(
    1,
    CML.Credential.new_pub_key(CML.Ed25519KeyHash.from_hex(stakeKeyHash))
  ).to_address()

  const protectedMap = new Map<number | string, unknown>()
  protectedMap.set(1, -8) // alg: EdDSA
  protectedMap.set('address', Buffer.from(rewardAddress.to_raw_bytes()))
  const protectedHeaders = encode(protectedMap)

  const payload = Buffer.from(message, 'utf8')
  const sigStructure = encode(['Signature1', protectedHeaders, Buffer.alloc(0), payload])
  const sigBytes = crypto.sign(null, sigStructure, privateKey)

  const signature = Buffer.from(
    encode([protectedHeaders, new Map(), payload, sigBytes])
  ).toString('hex')

  // COSE_Key uses integer labels — decoders return these as a Map, not an object.
  const coseKey = new Map<number, unknown>()
  coseKey.set(1, 1) // kty: OKP
  coseKey.set(3, -8) // alg: EdDSA
  coseKey.set(-1, 6) // crv: Ed25519
  coseKey.set(-2, Buffer.from(rawPub))
  const key = Buffer.from(encode(coseKey)).toString('hex')

  return { address, signature, key }
}

describe('verifyWalletSignature', () => {
  it('accepts a signature the wallet made with its stake key', async () => {
    const { address, signature, key } = signAsWallet(`Sign in to The Quest: ${NONCE}`)

    await expect(verifyWalletSignature(address, signature, key, NONCE)).resolves.toBe(true)
  })

  it('honours a custom message prefix', async () => {
    const { address, signature, key } = signAsWallet(`Link wallet to The Quest: ${NONCE}`)

    await expect(
      verifyWalletSignature(address, signature, key, NONCE, 'Link wallet to The Quest')
    ).resolves.toBe(true)
  })

  it('rejects a signature over a different nonce', async () => {
    const { address, signature, key } = signAsWallet(`Sign in to The Quest: ${NONCE}`)

    await expect(
      verifyWalletSignature(address, signature, key, 'some-other-nonce')
    ).resolves.toBe(false)
  })

  it('rejects a valid signature that does not belong to the claimed address', async () => {
    // Attacker signs the correct nonce with their own key, but claims someone
    // else's address. The key-hash binding must catch this.
    const victim = signAsWallet(`Sign in to The Quest: ${NONCE}`)
    const attacker = signAsWallet(`Sign in to The Quest: ${NONCE}`)

    await expect(
      verifyWalletSignature(victim.address, attacker.signature, attacker.key, NONCE)
    ).resolves.toBe(false)
  })

  it('rejects a tampered signature', async () => {
    const { address, signature, key } = signAsWallet(`Sign in to The Quest: ${NONCE}`)
    const tampered = signature.slice(0, -2) + (signature.endsWith('00') ? '11' : '00')

    await expect(verifyWalletSignature(address, tampered, key, NONCE)).resolves.toBe(false)
  })
})
