import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

interface SolanaProvidersProps {
  children: React.ReactNode;
  network: 'mainnet-beta' | 'devnet';
}

export const SolanaProviders: React.FC<SolanaProvidersProps> = ({ children, network }) => {
  // We use a more robust public RPC endpoint for mainnet to avoid 403 rate-limiting errors
  const endpoint = useMemo(() => {
    if (network === 'mainnet-beta') {
      // Using a reliable public proxy for better uptime in browser environments
      return 'https://solana-mainnet.rpc.extrnode.com';
    }
    return clusterApiUrl(network);
  }, [network]);
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};