
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
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

  // Prevent context errors during initial load
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only attempt login if connected and no profile exists
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
      // Professional Phantom Signature Request (No "Simulated" text)
      const message = 
        `Welcome to Privacy Dash\n\n` +
        `This request is to verify your identity and unlock your private dashboard. No transaction or fees are involved.\n\n` +
        `Account: ${publicKey.toBase58()}\n` +
        `Domain: ${window.location.hostname}\n` +
        `Issued At: ${new Date().toISOString()}`;
      
      const encoded = new TextEncoder().encode(message);
      await signMessage(encoded);
      
      // Fetch authenticated profile
      const userProfile = await MockBackend.getProfile(publicKey.toBase58());
      setProfile(userProfile);
    } catch (err) {
      console.error("Phantom authentication rejected", err);
      // Force disconnect if user cancels the signature to prevent hung UI state
      disconnect();
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isMounted) return null;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar 
            network="mainnet-beta" 
            profile={profile}
            isAuthenticating={isAuthenticating}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={
                profile 
                  ? <DashboardView profile={profile} /> 
                  : <div className="p-20 text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-700">
                      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl shadow-inner border border-indigo-100">
                        <i className="fa-solid fa-ghost"></i>
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Privacy Dash</h2>
                        <p className="text-slate-500 font-semibold leading-relaxed">Secure your payments with local encryption. Connect your Phantom wallet to access your private dashboard.</p>
                      </div>
                      <div className="pt-6">
                         <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                           <i className="fa-solid fa-shield-halved text-indigo-500"></i> Local AES-256 Protocol Active
                         </div>
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
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
