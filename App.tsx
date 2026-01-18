
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

const InfoCard = ({ icon, title, content }: { icon: string, title: string, content: string }) => (
  <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-2xl hover:border-[#00D1FF]/20 transition-all text-center space-y-4">
    <div className="w-12 h-12 bg-[#00D1FF]/10 rounded-xl flex items-center justify-center text-[#00D1FF] text-xl mx-auto">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h4 className="text-white font-bold text-sm uppercase tracking-widest">{title}</h4>
    <p className="text-slate-400 text-xs leading-relaxed uppercase tracking-wide">{content}</p>
  </div>
);

const ManifestCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl hover:bg-zinc-900 transition-colors">
    <div className="w-10 h-10 bg-[#00D1FF]/10 rounded-lg flex items-center justify-center text-[#00D1FF] text-lg mb-4">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
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
              Accept Solana and USDC directly. No middleman, no fees, and total privacy for your business transactions.
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

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
            <ManifestCard 
              icon="fa-key" 
              title="Secure Storage" 
              desc="Your transaction history is locked on your device. We never see your data."
            />
            <ManifestCard 
              icon="fa-user-secret" 
              title="Built-in Privacy" 
              desc="Only the payment amount is public. Everything else is hidden from the chain."
            />
            <ManifestCard 
              icon="fa-bolt" 
              title="Zero Middleman" 
              desc="Get paid instantly. No processing fees or third-party delays."
            />
        </div>
    </section>

    {/* Section: Simple Process */}
    <section className="bg-zinc-900/40 border-y border-white/5 py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-6">
            <h3 className="text-[#00D1FF] font-black text-sm uppercase tracking-[0.5em]">How it works</h3>
            <h2 className="text-4xl font-black text-white uppercase italic leading-tight">Payments Made Simple</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              Most platforms store your customer data on their servers. <strong>Privacy Dash</strong> uses local-first encryption, keeping your records strictly in your own browser.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[#00D1FF] text-xs font-bold shrink-0">1</div>
                <p className="text-sm text-slate-300 font-medium">Create a request with amount and internal notes.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[#00D1FF] text-xs font-bold shrink-0">2</div>
                <p className="text-sm text-slate-300 font-medium">Send the payment link to your customer.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[#00D1FF] text-xs font-bold shrink-0">3</div>
                <p className="text-sm text-slate-300 font-medium">Funds land in your wallet instantly. Records stay private.</p>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="space-y-6">
                <div className="p-4 bg-zinc-900 rounded-lg border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded flex items-center justify-center text-green-400">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Payment Received</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Settled</p>
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-white/5 flex items-center gap-4 opacity-60">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded flex items-center justify-center text-[#00D1FF]">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Data Locked</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Section: Benefits */}
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-none">Business Freedom</h2>
          <p className="text-slate-500 text-sm md:text-base font-medium tracking-wide">
            Modern payments without the modern surveillance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <InfoCard 
            icon="fa-shield-heart"
            title="Privacy First"
            content="Your business is your business. We don't track your sales or your clients."
           />
           <InfoCard 
            icon="fa-hand-holding-dollar"
            title="Instant Settlements"
            content="Skip the 5-day bank hold. Money arrives in seconds."
           />
           <InfoCard 
            icon="fa-file-export"
            title="Data Ownership"
            content="Export your encrypted history whenever you need."
           />
           <InfoCard 
            icon="fa-universal-access"
            title="Direct Control"
            content="Non-custodial. Only you have access to your terminal."
           />
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-32 px-6 text-center border-t border-white/5">
       <div className="max-w-xl mx-auto space-y-8">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Ready to Start?</h2>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Connect with Phantom to launch your terminal.</p>
          <div className="pt-6">
            <button 
              onClick={triggerConnect}
              className="px-12 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-[#00D1FF] hover:scale-105 transition-all uppercase italic shadow-xl"
            >
              Get Started
            </button>
          </div>
          <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em] pt-12">
            PRIVACY DASH // POWERED BY SOLANA PAY
          </p>
       </div>
    </footer>
  </div>
);

// Define ProtectedView props with explicit children and nullable profile
interface ProtectedViewProps {
  children: React.ReactNode;
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

  if (!isMounted) return null;

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

export default App;
