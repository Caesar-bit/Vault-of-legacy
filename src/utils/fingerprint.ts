export interface FingerprintRecord<T> {
  user: T;
  token: string;
}

export function hasFingerprint(userId: string): boolean {
  return localStorage.getItem(`vault_fingerprint_${userId}`) !== null;
}

export async function enrollFingerprint<T extends { id: string }>(user: T, token: string): Promise<void> {
  if (!('credentials' in navigator)) throw new Error('WebAuthn unsupported');
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: 'Vault of Legacy' },
    user: {
      id: new TextEncoder().encode(user.id),
      name: 'user',
      displayName: 'user',
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60000,
    authenticatorSelection: { userVerification: 'required' },
    attestation: 'none',
  };
  await navigator.credentials.create({ publicKey });
  const record: FingerprintRecord<T> = { user, token };
  localStorage.setItem(`vault_fingerprint_${user.id}`, JSON.stringify(record));
  localStorage.setItem('vault_fp_last', user.id);
}

export function removeFingerprint(userId: string): void {
  localStorage.removeItem(`vault_fingerprint_${userId}`);
  const last = localStorage.getItem('vault_fp_last');
  if (last === userId) localStorage.removeItem('vault_fp_last');
}

export async function authenticateFingerprint<T>(userId: string): Promise<FingerprintRecord<T> | null> {
  const stored = localStorage.getItem(`vault_fingerprint_${userId}`);
  if (!stored) return null;
  if (!('credentials' in navigator)) return null;
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
    };
    await navigator.credentials.get({ publicKey });
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
