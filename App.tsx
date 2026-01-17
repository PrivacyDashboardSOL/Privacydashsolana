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
        
        <main className={`flex-1 ${profile ? 'mt-16 px-6 py-12 max-w-6xl mx-auto w-full' : ''}`}>
          <Routes>
            <Route path="/" element={
              profile 
                ? <DashboardView profile={profile} /> 
                : <LandingPage triggerConnect={triggerConnect} isAuthenticating={isAuthenticating} />
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

const LandingPage = ({ triggerConnect, isAuthenticating }: { triggerConnect: () => void, isAuthenticating: boolean }) => (
  <div className="w-full">
    {/* Hero Section */}
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 max-w-6xl mx-auto pt-24 pb-32">
        <div className="max-w-3xl space-y-8 animate-in fade-in zoom-in duration-700">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
              Privacy <span className="text-[#00D1FF]">Dash</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-xl mx-auto leading-relaxed">
              Professional Solana Pay terminal. <br className="hidden md:block" /> 
              Local-first encryption for secure merchant operations.
            </p>
            
            <div className="pt-8">
                {isAuthenticating ? (
                  <div className="flex items-center justify-center gap-3 text-[#00D1FF]">
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold text-sm uppercase tracking-[0.3em]">SECURE_HANDSHAKE_IN_PROGRESS</span>
                  </div>
                ) : (
                  <button 
                    onClick={triggerConnect}
                    className="px-12 py-5 bg-[#00D1FF] text-black font-black text-xl rounded-2xl shadow-[0_10px_50px_rgba(0,209,255,0.3)] hover:scale-[1.05] transition-all uppercase italic"
                  >
                    Initialize Secure Session
                  </button>
                )}
            </div>
        </div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
            <ManifestCard 
              icon="fa-key" 
              title="Sovereign Keys" 
              desc="Keys are generated via Web Crypto API and never leave your local environment."
            />
            <ManifestCard 
              icon="fa-user-secret" 
              title="Private Invoices" 
              desc="Encrypted metadata ensures your business relationships remain confidential."
            />
            <ManifestCard 
              icon="fa-bolt" 
              title="Solana Pay" 
              desc="Direct, fee-free settlements on the world's most performant blockchain."
            />
        </div>
    </section>

    {/* Section: How it Works */}
    <section className="bg-zinc-900/40 border-y border-white/5 py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-6">
            <h3 className="text-[#00D1FF] font-black text-sm uppercase tracking-[0.5em]">The Protocol</h3>
            <h2 className="text-4xl font-black text-white uppercase italic leading-tight">How Privacy Dash Secures Your Data</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              Most payment dashboards store your business details on a central server. Privacy Dash flips the script. 
              We use the browser's <strong>SubtleCrypto API</strong> to derive an AES-256-GCM master key that exists 
              only in your specific browser profile.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[#00D1FF] text-xs font-bold shrink-0">1</div>
                <p className="text-sm text-slate-300 font-medium">Encrypt invoice line-items locally before deployment.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[#00D1FF] text-xs font-bold shrink-0">2</div>
                <p className="text-sm text-slate-300 font-medium">Public metadata (label, icon) is pushed to the Solana Pay protocol.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[#00D1FF] text-xs font-bold shrink-0">3</div>
                <p className="text-sm text-slate-300 font-medium">Unlock and decrypt records only when your master key is present.</p>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 text-[#00D1FF]">
                <i className="fa-solid fa-code text-6xl"></i>
              </div>
              <div className="space-y-6 font-mono text-[11px]">
                <div className="p-3 bg-zinc-900 rounded-lg border border-white/5">
                  <span className="text-purple-400">const</span> <span className="text-blue-400">masterKey</span> = <span className="text-yellow-400">await</span> <span className="text-cyan-400">subtle.generateKey</span>();
                </div>
                <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 opacity-60">
                   <span className="text-slate-500">// Payload isolated from server</span><br/>
                   <span className="text-purple-400">const</span> <span className="text-blue-400">ciphertext</span> = <span className="text-cyan-400">encrypt</span>(invoiceData);
                </div>
                <div className="p-3 bg-[#00D1FF]/10 rounded-lg border border-[#00D1FF]/30">
                   <span className="text-[#00D1FF]">SolanaPay.transfer</span>({<br/>
                   {/* Fix: Replaced nbsp with JSX string literal for non-breaking spaces */}
                   {"\u00A0\u00A0"}amount: <span className="text-white">5.0</span>,<br/>
                   {"\u00A0\u00A0"}label: <span className="text-white">"Premium Asset"</span><br/>
                   });
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Section: Why Use This? */}
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic">Why Privacy Matters</h2>
          <p className="text-slate-500 text-sm md:text-base font-medium tracking-wide">
            Your business activity shouldn't be a public book. Privacy Dash bridges the gap between public settlement and private operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <InfoCard 
            icon="fa-shield-heart"
            title="Zero Logs"
            content="We don't have a backend database for your customer data. It's stored in the ciphertext of the Solana chain or your browser."
           />
           <InfoCard 
            icon="fa-hand-holding-dollar"
            title="Instant Settle"
            content="Bypass high-fee processors. Receive SOL or USDC directly into your wallet with zero latency."
           />
           <InfoCard 
            icon="fa-file-export"
            title="Portable Data"
            content="Export your master key and database anytime. You are never locked into our platform."
           />
           <InfoCard 
            icon="fa-universal-access"
            title="Non-Custodial"
            content="We never touch your funds. You sign every transaction through your own Phantom session."
           />
        </div>
      </div>
    </section>

    {/* Section: Best Practices & Ideas */}
    <section className="bg-[#00D1FF]/5 py-32 px-6 border-t border-[#00D1FF]/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-[#00D1FF] font-black text-xs uppercase tracking-[0.5em]">Creative Use Cases</h3>
            <h2 className="text-3xl font-black text-white italic uppercase">How to Use Privacy Dash</h2>
          </div>
          
          <div className="space-y-8">
             <div className="flex gap-6 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:bg-[#00D1FF] group-hover:text-black transition-all">
                   <i className="fa-solid fa-palette"></i>
                </div>
                <div className="space-y-2">
                   <h4 className="font-bold text-white uppercase tracking-tight">Art & Collectibles</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">Sell high-value digital assets without exposing the buyer's private delivery address or confidential terms to the public chain.</p>
                </div>
             </div>
             <div className="flex gap-6 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:bg-[#00D1FF] group-hover:text-black transition-all">
                   <i className="fa-solid fa-user-doctor"></i>
                </div>
                <div className="space-y-2">
                   <h4 className="font-bold text-white uppercase tracking-tight">Consultation Fees</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">Accept payment for professional services while keeping internal client IDs and case notes encrypted in the transaction metadata.</p>
                </div>
             </div>
             <div className="flex gap-6 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:bg-[#00D1FF] group-hover:text-black transition-all">
                   <i className="fa-solid fa-building"></i>
                </div>
                <div className="space-y-2">
                   <h4 className="font-bold text-white uppercase tracking-tight">B2B Private Settlements</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">Settle vendor invoices with line-item transparency that only the involved parties can verify upon key exchange.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-10">
           <div className="bg-black border border-white/10 p-10 rounded-3xl space-y-8">
              <h4 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-3">
                <i className="fa-solid fa-lightbulb text-yellow-400"></i> Best Practices
              </h4>
              <ul className="space-y-6">
                <li className="space-y-2">
                  <p className="text-xs font-black text-[#00D1FF] uppercase tracking-widest italic">1. Export Your Vault Key</p>
                  <p className="text-sm text-slate-400">Your master key is the only way to read your invoice history. Back it up to an offline password manager or physical medium immediately.</p>
                </li>
                <li className="space-y-2">
                  <p className="text-xs font-black text-[#00D1FF] uppercase tracking-widest italic">2. Use Descriptive Labels</p>
                  <p className="text-sm text-slate-400">While metadata is private, your public Merchant Label should be clear so customers trust the transaction when Phantom prompts them.</p>
                </li>
                <li className="space-y-2">
                  <p className="text-xs font-black text-[#00D1FF] uppercase tracking-widest italic">3. Verify via Solscan</p>
                  <p className="text-sm text-slate-400">Every paid invoice includes a signature link. Use this to audit the underlying Solana settlement without relying on our UI.</p>
                </li>
              </ul>
           </div>
        </div>
      </div>
    </section>

    {/* Footer Call to Action */}
    <footer className="py-32 px-6 text-center">
       <div className="max-w-xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Network Ready // Solana Mainnet-Beta</span>
          </div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Ready to Deploy?</h2>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Join the new era of private merchant operations.</p>
          <div className="pt-6">
            <button 
              onClick={triggerConnect}
              className="px-12 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-[#00D1FF] hover:scale-105 transition-all uppercase italic shadow-xl"
            >
              Get Started Now
            </button>
          </div>
          <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em] pt-12">
            PRIVACY DASH // REVISION 4.2.0-ALPHA // BUILT ON SOLANA
          </p>
       </div>
    </footer>
  </div>
);

const InfoCard = ({ icon, title, content }: { icon: string, title: string, content: string }) => (
  <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-2xl hover:border-[#00D1FF]/20 hover:bg-zinc-900 transition-all text-center space-y-4">
    <div className="w-12 h-12 bg-[#00D1FF]/10 rounded-xl flex items-center justify-center text-[#00D1FF] text-xl mx-auto shadow-[inset_0_0_15px_rgba(0,209,255,0.1)]">
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

export default App;