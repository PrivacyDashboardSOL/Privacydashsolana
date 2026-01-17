
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
  const { publicKey, signMessage, disconnect, connected } = useWallet();
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

  if (!isMounted) return null;

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-[#070A0F]">
        <TopNav profile={profile} />
        
        <main className="flex-1 mt-24 overflow-y-auto px-12 py-10">
          <Routes>
            <Route path="/" element={
              profile 
                ? <DashboardView profile={profile} /> 
                : <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-10">
                    <div className="w-32 h-32 bg-white/5 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl border border-white/10 animate-pulse">
                      <i className="fa-solid fa-shield-halved text-[#00D1FF] accent-glow"></i>
                    </div>
                    <div className="space-y-4 max-w-xl">
                      <h2 className="text-6xl font-black italic tracking-tighter text-white">READY TO ACCESS?</h2>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">ENCRYPTED DATA TERMINAL REQUIRES PHANTOM HANDSHAKE</p>
                    </div>
                    <div className="p-1 px-8 bg-white/5 rounded-full border border-white/5 text-[10px] font-black text-[#00D1FF] uppercase tracking-[0.4em]">
                      Awaiting Signature Input
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

export default App;
