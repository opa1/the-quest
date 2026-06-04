import { decode, encode } from 'cbor-x'
import crypto from 'crypto'

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
    if (!Array.isArray(coseSign1) || coseSign1.length < 4) return false

    const protectedHeadersBytes = coseSign1[0] as Buffer
    const payload = coseSign1[2] as Buffer | null
    const sigBytes = coseSign1[3] as Buffer

    if (!payload) return false

    const expectedMessage = `${messagePrefix}: ${nonce}`
    if (Buffer.from(payload).toString('utf8') !== expectedMessage) return false

    // Decode COSEKey -- integer keys decoded as string keys by cbor-x
    // Key "-2" holds the Ed25519 public key bytes (32 bytes)
    const coseKey = decode(Buffer.from(key, 'hex')) as Record<string, unknown>
    const pubKeyBytes = coseKey['-2'] as Buffer | undefined
    if (!pubKeyBytes || pubKeyBytes.length !== 32) return false

    // Reconstruct Sig_Structure: ["Signature1", protected_headers_bytes, b"", payload]
    const sigStructure = encode(['Signature1', protectedHeadersBytes, Buffer.alloc(0), payload])

    const importedKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(pubKeyBytes),
      { name: 'Ed25519' },
      false,
      ['verify']
    )

    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      importedKey,
      new Uint8Array(sigBytes),
      new Uint8Array(sigStructure)
    )
  } catch (err) {
    console.error('[verifyWalletSignature] failed:', err)
    return false
  }
}
