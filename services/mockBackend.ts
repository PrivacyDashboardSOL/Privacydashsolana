
import { SolanaPayRequest, RequestStatus, Stats, UserProfile } from '../types';

const STORAGE_KEY = 'privacy_dash_v1_mainnet';
const PROFILES_KEY = 'privacy_dash_profiles';

function getStore(): SolanaPayRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse store", e);
    return [];
  }
}

function saveStore(requests: SolanaPayRequest[]) {
  try {
    const sanitized = requests.map(r => ({
      id: String(r.id),
      reference: String(r.reference),
      amount: Number(r.amount),
      tokenMint: String(r.tokenMint),
      expiresAt: String(r.expiresAt),
      createdAt: String(r.createdAt),
      status: r.status,
      label: String(r.label),
      icon: String(r.icon),
      ciphertext: String(r.ciphertext),
      signature: r.signature ? String(r.signature) : undefined,
      payer: r.payer ? String(r.payer) : undefined,
      creator: String(r.creator),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error("Failed to save store", e);
  }
}

function getProfiles(): Record<string, UserProfile> {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to parse profiles", e);
    return {};
  }
}

function saveProfile(profile: UserProfile) {
  try {
    const profiles = getProfiles();
    profiles[profile.pubkey] = {
      pubkey: String(profile.pubkey),
      displayName: profile.displayName ? String(profile.displayName) : undefined,
      avatarUrl: profile.avatarUrl ? String(profile.avatarUrl) : undefined,
      lastLoginAt: String(profile.lastLoginAt),
      balance: Number(profile.balance),
    };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

export const MockBackend = {
  getProfile: async (pubkey: string): Promise<UserProfile> => {
    const profiles = getProfiles();
    if (profiles[pubkey]) return profiles[pubkey];
    
    const newProfile: UserProfile = {
      pubkey: String(pubkey),
      lastLoginAt: new Date().toISOString(),
      balance: 5.42, // Mock initial balance
    };
    saveProfile(newProfile);
    return newProfile;
  },

  createRequest: async (payload: Partial<SolanaPayRequest>, creator: string): Promise<SolanaPayRequest> => {
    const store = getStore();
    const newRequest: SolanaPayRequest = {
      id: Math.random().toString(36).substring(7),
      reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      amount: Number(payload.amount) || 0,
      tokenMint: String(payload.tokenMint || 'SOL'),
      expiresAt: String(payload.expiresAt || new Date(Date.now() + 86400000).toISOString()),
      label: String(payload.label || 'Privacy Dash Invoice'),
      icon: String(payload.icon || 'https://picsum.photos/200'),
      ciphertext: String(payload.ciphertext || ''),
      creator: String(creator),
    };
    store.push(newRequest);
    saveStore(store);
    return newRequest;
  },

  getRequest: async (id: string): Promise<SolanaPayRequest | undefined> => {
    return getStore().find(r => r.id === id);
  },

  getAllRequests: async (creator?: string) => {
    const store = getStore();
    if (creator) {
      return store.filter(r => r.creator === creator).reverse();
    }
    return store.reverse();
  },

  markPaid: async (id: string, signature: string, payer: string) => {
    const store = getStore();
    const idx = store.findIndex(r => r.id === id);
    if (idx !== -1) {
      store[idx].status = RequestStatus.PAID;
      store[idx].signature = String(signature);
      store[idx].payer = String(payer);
      saveStore(store);
    }
  },

  cancelRequest: async (id: string) => {
    const store = getStore();
    const idx = store.findIndex(r => r.id === id);
    if (idx !== -1) {
      store[idx].status = RequestStatus.CANCELLED;
      saveStore(store);
    }
  },

  getStats: async (creator: string): Promise<Stats> => {
    const store = getStore().filter(r => r.creator === creator);
    const today = new Date().toISOString().split('T')[0];
    const soon = new Date(Date.now() + 3600000).toISOString();

    return {
      totalCollected: store.filter(r => r.status === RequestStatus.PAID).reduce((acc, r) => acc + r.amount, 0),
      pendingRequests: store.filter(r => r.status === RequestStatus.PENDING).length,
      paidToday: store.filter(r => r.status === RequestStatus.PAID && r.createdAt.startsWith(today)).length,
      expiringSoon: store.filter(r => r.status === RequestStatus.PENDING && r.expiresAt < soon).length,
    };
  }
};
