import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import TopNav from './components/TopNav';
import DashboardView from './views/DashboardView';
import CreateRequestView from './views/CreateRequestView';
import RequestsView from './views/RequestsView';
import PayView from './views/PayView';
import ReceiptsView from './views/ReceiptsView';
import SettingsView from './views/SettingsView';
import { MockBackend } from './services/mockBackend';
import { UserProfile } from './types';
import { ICONS } from './constants';
import { SolanaProviders } from './components/SolanaProviders';

const VaultLockedView = ({ onAuth, isAuthenticating }: { onAuth: () => void, isAuthenticating: boolean }) => (
  <div className="min-h-[70vh] flex items-center justify-center px-6">
    <div className="max-w-md w-full premium-panel p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500 border-[#00D1FF]/20">
      <div className="w-20 h-20 bg-[#00D1FF]/10 rounded-3xl flex items-center justify-center text-3xl text-[#00D1FF] mx-auto border border-[#00D1FF]/20 accent-glow">
        {ICONS.Shield}
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-tight">Handshake Required</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Vault session is currently isolated.</p>
      </div>
      
      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
        <p className="text-xs text-slate-400 leading-relaxed font-medium uppercase italic">
          To access internal modules and decrypt your local archives, you must authorize a secure session via Phantom.
        </p>
      </div>

      <div className="pt-4">
        <button 
          onClick={onAuth}
          disabled={isAuthenticating}
          className="w-full py-5 bg-[#00D1FF] text-black font-black text-lg rounded-2xl shadow-[0_10px_40px_rgba(0,209,255,0.2)] hover:scale-105 transition-all uppercase italic flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isAuthenticating ? (
            <><i className="fa-solid fa-circle-notch animate-spin"></i> Authenticating...</>
          ) : (
            <><i className="fa-solid fa-key"></i> Authorize Vault</>
          )}
        </button>
      </div>
      
      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em] pt-4">
        AES-256_LOCAL_STORAGE_PROXIED
      </p>
    </div>
  </div>
);

const LandingPage = ({ triggerConnect, isAuthenticating }: { triggerConnect: () => void, isAuthenticating: boolean }) => (
  <div className="w-full">
    {/* Hero Section */}
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 max-w-6xl mx-auto pt-24 pb-32">
        <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in duration-700">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
              The Private Way <br/> to <span className="text-[#00D1FF]">Get Paid</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              Accept Solana directly. No middleman, no fees, and total privacy for your business transactions.
            </p>
            
            <div className="pt-8">
                {isAuthenticating ? (
                  <div className="flex items-center justify-center gap-3 text-[#00D1FF]">
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold text-sm uppercase tracking-[0.3em]">SECURE_HANDSHAKE</span>
                  </div>
                ) : (
                  <button 
                    onClick={triggerConnect}
                    className="px-12 py-5 bg-[#00D1FF] text-black font-black text-xl rounded-2xl shadow-[0_10px_50px_rgba(0,209,255,0.3)] hover:scale-[1.05] transition-all uppercase italic"
                  >
                    Open Dashboard
                  </button>
                )}
            </div>
        </div>
    </section>
  </div>
);

interface ProtectedViewProps {
  children?: React.ReactNode;
  profile: UserProfile | null;
  onAuth: () => void | Promise<void>;
  isAuthenticating: boolean;
}

const ProtectedView = ({ children, profile, onAuth, isAuthenticating }: ProtectedViewProps) => {
  if (!profile) {
    return (
      <VaultLockedView 
        onAuth={onAuth as () => void} 
        isAuthenticating={isAuthenticating} 
      />
    );
  }
  return <>{children}</>;
};

const AppContent: React.FC<{
  network: 'mainnet-beta' | 'devnet',
  setNetwork: (n: 'mainnet-beta' | 'devnet') => void
}> = ({ network, setNetwork }) => {
  const { publicKey, signMessage, disconnect, connected, select, wallets, connect } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (connected && publicKey && !profile && !isAuthenticating) {
      handleLogin();
    } else if (!connected && profile) {
      setProfile(null);
    }
  }, [connected, publicKey, profile, isAuthenticating]);

  const handleLogin = async () => {
    if (!publicKey || !signMessage) return;
    setIsAuthenticating(true);
    try {
      const message = 
        `Authorize Privacy Dash Session\n\n` +
        `Requesting secure access to merchant terminal.\n\n` +
        `Wallet: ${publicKey.toBase58()}\n` +
        `Timestamp: ${Date.now()}`;
      
      const encoded = new TextEncoder().encode(message);
      await signMessage(encoded);
      
      const userProfile = await MockBackend.getProfile(publicKey.toBase58());
      setProfile(userProfile);
    } catch (err) {
      console.error("Auth rejected", err);
      disconnect();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLockVault = () => {
    setProfile(null);
  };

  const triggerConnect = async () => {
    try {
      const phantom = wallets.find(w => w.adapter.name === 'Phantom');
      if (phantom) {
        await select(phantom.adapter.name);
        await connect();
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (err) {
      console.error("Connect failed", err);
    }
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-black text-slate-200">
        <TopNav 
          profile={profile} 
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onAuthTrigger={triggerConnect}
          onLockVault={handleLockVault}
          isAuthenticating={isAuthenticating}
          network={network}
          onNetworkChange={setNetwork}
        />
        
        <main className={`flex-1 ${profile ? 'mt-16 px-6 py-12 max-w-6xl mx-auto w-full' : ''}`}>
          <Routes>
            <Route path="/" element={
              profile 
                ? <DashboardView profile={profile} /> 
                : <LandingPage triggerConnect={triggerConnect} isAuthenticating={isAuthenticating} />
            } />
            <Route path="/create" element={<ProtectedView profile={profile} onAuth={triggerConnect} isAuthenticating={isAuthenticating}><CreateRequestView profile={profile} /></ProtectedView>} />
            <Route path="/requests" element={<ProtectedView profile={profile} onAuth={triggerConnect} isAuthenticating={isAuthenticating}><RequestsView searchQuery={searchQuery} profile={profile} /></ProtectedView>} />
            <Route path="/receipts" element={<ProtectedView profile={profile} onAuth={triggerConnect} isAuthenticating={isAuthenticating}><ReceiptsView profile={profile} /></ProtectedView>} />
            <Route path="/settings" element={<ProtectedView profile={profile} onAuth={triggerConnect} isAuthenticating={isAuthenticating}><SettingsView profile={profile} /></ProtectedView>} />
            <Route path="/pay/:id" element={<PayView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => {
  const [network, setNetwork] = useState<'mainnet-beta' | 'devnet'>('devnet');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <SolanaProviders network={network}>
      <AppContent network={network} setNetwork={setNetwork} />
    </SolanaProviders>
  );
};

export default App;