
import { SolanaPayRequest, RequestStatus, Stats, UserProfile } from '../types';

const STORAGE_KEY = 'privacy_dash_v1_mainnet';
const PROFILES_KEY = 'privacy_dash_profiles';

function getStore(): SolanaPayRequest[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveStore(requests: SolanaPayRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function getProfiles(): Record<string, UserProfile> {
  const data = localStorage.getItem(PROFILES_KEY);
  return data ? JSON.parse(data) : {};
}

function saveProfile(profile: UserProfile) {
  const profiles = getProfiles();
  profiles[profile.pubkey] = profile;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export const MockBackend = {
  // Simulated GET /api/me
  getProfile: async (pubkey: string): Promise<UserProfile> => {
    const profiles = getProfiles();
    if (profiles[pubkey]) return profiles[pubkey];
    
    const newProfile: UserProfile = {
      pubkey,
      lastLoginAt: new Date().toISOString(),
      balance: Math.random() * 10, // Simulated balance
    };
    saveProfile(newProfile);
    return newProfile;
  },

  // Simulated POST /api/requests
  createRequest: async (payload: Partial<SolanaPayRequest>, creator: string): Promise<SolanaPayRequest> => {
    const store = getStore();
    const newRequest: SolanaPayRequest = {
      id: Math.random().toString(36).substring(7),
      reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      amount: payload.amount || 0,
      tokenMint: payload.tokenMint || 'SOL',
      expiresAt: payload.expiresAt || new Date(Date.now() + 86400000).toISOString(),
      label: payload.label || 'Privacy Dash Invoice',
      icon: payload.icon || 'https://picsum.photos/200',
      ciphertext: payload.ciphertext || '',
      creator,
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
      store[idx].signature = signature;
      store[idx].payer = payer;
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
