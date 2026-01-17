
import React from 'react';

export const COLORS = {
  primary: '#14F195', // Solana Green
  secondary: '#9945FF', // Solana Purple
  bg: '#0F172A',
  card: '#1E293B',
};

export const MOCK_TOKENS = [
  { symbol: 'SOL', mint: '11111111111111111111111111111111', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' }
];

export const ICONS = {
  Dashboard: <i className="fa-solid fa-chart-line"></i>,
  Create: <i className="fa-solid fa-plus-circle"></i>,
  Requests: <i className="fa-solid fa-list-ul"></i>,
  Receipts: <i className="fa-solid fa-receipt"></i>,
  Settings: <i className="fa-solid fa-gear"></i>,
  Copy: <i className="fa-solid fa-copy"></i>,
  Wallet: <i className="fa-solid fa-wallet"></i>,
  Search: <i className="fa-solid fa-magnifying-glass"></i>,
  Export: <i className="fa-solid fa-file-export"></i>,
};
