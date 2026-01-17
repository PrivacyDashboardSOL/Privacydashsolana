
export enum RequestStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface LineItem {
  description: string;
  amount: number;
}

export interface PrivateInvoiceData {
  title: string;
  items: LineItem[];
  notes: string;
}

export interface SolanaPayRequest {
  id: string;
  reference: string;
  amount: number;
  tokenMint: string;
  expiresAt: string;
  createdAt: string;
  status: RequestStatus;
  label: string; // Public
  icon: string;  // Public
  ciphertext: string; // Encrypted PrivateInvoiceData
  signature?: string;
  payer?: string;
  creator: string; // The wallet address that created the request
}

export interface Stats {
  totalCollected: number;
  pendingRequests: number;
  paidToday: number;
  expiringSoon: number;
}

export interface UserProfile {
  pubkey: string;
  displayName?: string;
  avatarUrl?: string;
  lastLoginAt: string;
  balance: number;
}
