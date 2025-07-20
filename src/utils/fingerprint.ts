import { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function hasFingerprint(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/fingerprint/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.enabled;
}

export async function enrollFingerprint(user: User, token: string): Promise<void> {
  if (!('credentials' in navigator)) throw new Error('WebAuthn unsupported');
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: 'Vault of Legacy' },
    user: {
      id: new TextEncoder().encode(user.id),
      name: user.email,
      displayName: user.name,
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60000,
    authenticatorSelection: { userVerification: 'required' },
    attestation: 'none',
  };
  const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;
  if (!cred) throw new Error('Enrollment cancelled');
  const credentialId = bufToBase64(cred.rawId);
  const res = await fetch(`${API_BASE}/api/fingerprint/enroll`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credentialId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeFingerprint(token: string): Promise<void> {
  await fetch(`${API_BASE}/api/fingerprint`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function authenticateFingerprint<T = User>(userId: string): Promise<{ user: T; token: string } | null> {
  if (!('credentials' in navigator)) return null;
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
  };
  const cred = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
  if (!cred) return null;
  const credentialId = bufToBase64(cred.rawId);
  const res = await fetch(`${API_BASE}/api/fingerprint/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, credentialId }),
  });
  if (!res.ok) return null;
  return res.json();
}
