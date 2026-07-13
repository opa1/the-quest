import { decode, encode } from 'cbor-x'
import crypto from 'crypto'

function fail(reason: string): false {
  // Keep the caller's user-facing message generic, but leave a precise trail in
  // the server logs — every failure here looks identical from the client.
  console.warn('[verifyWalletSignature] rejected:', reason)
  return false
}

// cbor-x decodes CBOR maps to a Map with their original (integer) keys, so the
// COSE label -2 must be read with .get(-2) — `coseKey['-2']` is always
// undefined. Tolerate a plain object too, in case the decoder is ever
// configured with `mapsAsObjects`.
function coseLabel(coseKey: unknown, label: number): unknown {
  if (coseKey instanceof Map) return coseKey.get(label)
  if (coseKey && typeof coseKey === 'object') {
    return (coseKey as Record<string, unknown>)[String(label)]
  }
  return undefined
}

export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  key: string,
  nonce: string,
  messagePrefix = 'Sign in to The Quest'
): Promise<boolean> {
  try {
    // Decode COSESign1: [protected_headers_bytes, unprotected, payload, sig_bytes]
    const coseSign1 = decode(Buffer.from(signature, 'hex')) as unknown[]
    if (!Array.isArray(coseSign1) || coseSign1.length < 4) {
      return fail('malformed COSE_Sign1')
    }

    const protectedHeadersBytes = coseSign1[0] as Buffer
    const payload = coseSign1[2] as Buffer | null
    const sigBytes = coseSign1[3] as Buffer

    if (!payload) return fail('COSE_Sign1 has no payload')

    const expectedMessage = `${messagePrefix}: ${nonce}`
    if (Buffer.from(payload).toString('utf8') !== expectedMessage) {
      return fail('signed payload does not match the expected message')
    }

    // COSE_Key label -2 holds the Ed25519 public key bytes (32 bytes).
    const coseKey = decode(Buffer.from(key, 'hex'))
    const pubKeyBytes = coseLabel(coseKey, -2) as Buffer | undefined
    if (!pubKeyBytes || pubKeyBytes.length !== 32) {
      return fail(`COSE_Key has no valid Ed25519 public key (-2)`)
    }

    // Reconstruct Sig_Structure: ["Signature1", protected_headers_bytes, b"", payload]
    const sigStructure = encode(['Signature1', protectedHeadersBytes, Buffer.alloc(0), payload])

    const importedKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(pubKeyBytes),
      { name: 'Ed25519' },
      false,
      ['verify']
    )

    const verified = await crypto.subtle.verify(
      { name: 'Ed25519' },
      importedKey,
      new Uint8Array(sigBytes),
      new Uint8Array(sigStructure)
    )
    if (!verified) return fail('Ed25519 signature is invalid')

    // Bind the signing key to the claimed address. The public key's hash must
    // match one of the address's credentials — otherwise anyone could sign the
    // nonce with their own key and impersonate an arbitrary wallet address.
    //
    // Wallets sign CIP-8 messages with the *stake* key (the connector calls
    // signData with getRewardAddresses()[0]), so in practice this matches the
    // address's stake credential; the payment credential is accepted too for
    // wallets that sign with the payment key.
    const { getAddressDetails } = await import('@lucid-evolution/utils')
    const { CML } = await import('@lucid-evolution/lucid')
    const keyHashHex = CML.PublicKey.from_bytes(new Uint8Array(pubKeyBytes))
      .hash()
      .to_hex()
      .toLowerCase()
    const details = getAddressDetails(walletAddress)
    const credentialHashes = [
      details.paymentCredential?.hash,
      details.stakeCredential?.hash,
    ]
      .filter((h): h is string => Boolean(h))
      .map((h) => h.toLowerCase())

    if (!credentialHashes.includes(keyHashHex)) {
      return fail(
        `signing key ${keyHashHex} is not a credential of ${walletAddress}`
      )
    }

    return true
  } catch (err) {
    console.error('[verifyWalletSignature] threw:', err)
    return false
  }
}
