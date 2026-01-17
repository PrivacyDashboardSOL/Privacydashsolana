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

const App: React.FC = () => {
  const { publicKey, signMessage, disconnect, connected, select, wallets, connect } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-black text-slate-200">
        <TopNav 
          profile={profile} 
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onAuthTrigger={triggerConnect}
        />
        
        <main className="flex-1 mt-16 px-6 py-12 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={
              profile 
                ? <DashboardView profile={profile} /> 
                : <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                    <div className="max-w-2xl space-y-6 mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
                          Privacy Dash
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg mx-auto">
                          A high-security Solana Pay merchant terminal with local-first encryption.
                        </p>
                        
                        <div className="pt-4">
                           {isAuthenticating ? (
                              <div className="flex items-center justify-center gap-3 text-[#00D1FF]">
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-bold text-sm uppercase tracking-widest">Verifying Identity...</span>
                              </div>
                           ) : (
                              <button 
                                onClick={triggerConnect}
                                className="px-8 py-4 bg-[#00D1FF] text-black font-bold text-lg rounded-xl shadow-lg hover:scale-[1.02] transition-all uppercase"
                              >
                                Initialize Secure Session
                              </button>
                           )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                        <ManifestCard 
                          icon="fa-key" 
                          title="Local Storage" 
                          desc="AES-256-GCM encryption keys are generated and stored exclusively in your browser sandbox."
                        />
                        <ManifestCard 
                          icon="fa-user-secret" 
                          title="Encrypted Invoices" 
                          desc="Confidential details are encrypted before relay. Only the master terminal can view them."
                        />
                        <ManifestCard 
                          icon="fa-bolt" 
                          title="Solana Pay" 
                          desc="Standard protocol compliance for instant settlement directly on the Solana network."
                        />
                    </div>
                  </div>
            } />
            <Route path="/create" element={<CreateRequestView profile={profile} />} />
            <Route path="/requests" element={<RequestsView searchQuery={searchQuery} profile={profile} />} />
            <Route path="/receipts" element={<ReceiptsView profile={profile} />} />
            <Route path="/settings" element={<SettingsView profile={profile} />} />
            <Route path="/pay/:id" element={<PayView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const ManifestCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl hover:bg-zinc-900 transition-colors">
    <div className="w-10 h-10 bg-[#00D1FF]/10 rounded-lg flex items-center justify-center text-[#00D1FF] text-lg mb-4">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;