
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
        `ACCESS GRANTED: PRIVACY DASH COMMAND\n\n` +
        `AUTHENTICATION TOKEN REQUIRED FOR SESSION INITIATION.\n\n` +
        `ACCOUNT ID: ${publicKey.toBase58()}\n` +
        `TIMESTAMP: ${Date.now()}`;
      
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
    const phantom = wallets.find(w => w.adapter.name === 'Phantom');
    if (phantom) {
      await select(phantom.adapter.name);
      await connect();
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };

  if (!isMounted) return null;

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-[#070A0F]">
        <TopNav 
          profile={profile} 
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />
        
        <main className="flex-1 mt-24 overflow-y-auto px-12 py-10">
          <Routes>
            <Route path="/" element={
              profile 
                ? <DashboardView profile={profile} /> 
                : <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-6xl mx-auto py-20">
                    <div className="text-center space-y-8 mb-20 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border border-white/10 mx-auto mb-10 group hover:border-[#00D1FF]/50 transition-all duration-500">
                          <i className="fa-solid fa-shield-halved text-[#00D1FF] accent-glow group-hover:scale-110 transition-transform"></i>
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none">The Privacy Dashboard</h2>
                          <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-xs">Zero-Knowledge Merchant Terminal</p>
                        </div>
                        
                        <div className="pt-6">
                           {isAuthenticating ? (
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-[#00D1FF] uppercase tracking-widest">Awaiting Wallet Handshake...</p>
                              </div>
                           ) : (
                              <button 
                                onClick={triggerConnect}
                                className="px-12 py-5 bg-[#00D1FF] text-black font-black text-lg italic tracking-tighter hover:scale-105 transition-all rounded-2xl shadow-[0_20px_50px_rgba(0,209,255,0.2)]"
                              >
                                INITIALIZE SECURE SESSION
                              </button>
                           )}
                        </div>
                    </div>

                    {/* Privacy Manifest Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                        <ManifestCard 
                          icon="fa-key" 
                          title="LOCAL KEYS" 
                          desc="Your Master Key never leaves your browser's local storage. We have zero access to your data."
                        />
                        <ManifestCard 
                          icon="fa-user-secret" 
                          title="PRIVATE INVOICES" 
                          desc="Line items and notes are encrypted with AES-256 before being indexed. Only you can decrypt them."
                        />
                        <ManifestCard 
                          icon="fa-bolt" 
                          title="SOLANA PAY" 
                          desc="Built on official protocol standards. Payments are direct peer-to-peer with zero middleman fees."
                        />
                    </div>
                    
                    <div className="mt-20 flex flex-col items-center gap-4 opacity-20">
                       <div className="h-px w-24 bg-white"></div>
                       <p className="text-[9px] font-black text-white uppercase tracking-[1em]">Phantom Verified</p>
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
  <div className="premium-panel p-8 space-y-4 border-white/5 hover:border-[#00D1FF]/20 bg-white/2">
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#00D1FF] text-xl mb-2">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h4 className="text-xs font-black text-white tracking-widest uppercase italic">{title}</h4>
    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">{desc}</p>
  </div>
);

export default App;
