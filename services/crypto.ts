
/**
 * AES-GCM encryption wrapper for Privacy Dash.
 * Keys are derived locally and persisted in the browser's secure context.
 */

const ENCRYPTION_KEY_LABEL = 'privacy_dash_master_key';

async function getMasterKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(ENCRYPTION_KEY_LABEL);
  if (!stored) {
    // Initialize a new master key for the first session on this terminal
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    localStorage.setItem(ENCRYPTION_KEY_LABEL, JSON.stringify(exported));
    return key;
  }
  return await window.crypto.subtle.importKey(
    "jwk",
    JSON.parse(stored),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(data: any): Promise<string> {
  const key = await getMasterKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(ciphertextBase64: string): Promise<any> {
  try {
    const key = await getMasterKey();
    const combined = new Uint8Array(atob(ciphertextBase64).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
}

export function resetMasterKey() {
    localStorage.removeItem(ENCRYPTION_KEY_LABEL);
}
