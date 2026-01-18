import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import { useWallet } from '@solana/wallet-adapter-react';
import { UserProfile } from '../types';

interface TopNavProps {
  profile: UserProfile | null;
  searchQuery: string;
  onSearch: (val: string) => void;
  onAuthTrigger: () => void;
  onLockVault: () => void;
  isAuthenticating: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ profile, searchQuery, onSearch, onAuthTrigger, onLockVault, isAuthenticating }) => {
  const { connected, disconnect, publicKey } = useWallet();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [shakingItem, setShakingItem] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: ICONS.Dashboard, protected: false },
    { name: 'Create', path: '/create', icon: ICONS.Create, protected: true },
    { name: 'History', path: '/requests', icon: ICONS.Requests, protected: true },
    { name: 'Receipts', path: '/receipts', icon: ICONS.Receipts, protected: true },
    { name: 'Settings', path: '/settings', icon: ICONS.Settings, protected: true },
  ];

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (!profile && item.protected) {
      e.preventDefault();
      setShakingItem(item.name);
      onAuthTrigger();
      setTimeout(() => setShakingItem(null), 500);
    }
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <nav className="h-16 px-6 flex items-center border-b border-white/10 bg-black fixed top-0 w-full z-[100] backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center shrink-0">
        <NavLink to="/" className="flex items-center">
          <div className="h-16 w-48 flex items-center justify-center overflow-hidden">
            <img 
              src="https://i.postimg.cc/QdKmjG6X/Untitled-design-(47).png" 
              alt="Logo" 
              className="w-full h-full object-contain scale-125" 
            />
          </div>
        </NavLink>
      </div>

      <div className="h-6 w-px bg-white/10 mx-6 shrink-0 hidden lg:block"></div>

      {/* Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => handleNavClick(e, item)}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap relative ${
                shakingItem === item.name ? 'animate-shake text-red-400' : ''
              } ${
                (isActive && profile) 
                  ? 'text-[#00D1FF] bg-[#00D1FF]/10' 
                  : !profile && item.protected 
                    ? 'text-slate-600 cursor-pointer hover:bg-white/5' 
                    : 'text-slate-400 hover:bg-white/5'
              }`
            }
          >
            <span className="opacity-80">{item.icon}</span>
            <span className="hidden md:block">{item.name}</span>
            {!profile && item.protected && (
              <span className="text-[10px] opacity-40 ml-1">{ICONS.Lock}</span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="flex-1"></div>

      {/* Tools */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="relative w-40 lg:w-56 hidden sm:block">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            {ICONS.Search}
          </div>
          <input 
            type="text"
            placeholder="Search terminal..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white focus:border-[#00D1FF]/50 outline-none transition-all placeholder:text-slate-600 font-medium"
          />
        </div>

        {connected && publicKey ? (
          <div className="relative shrink-0">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-cyan-500/50 transition-all ${isAuthenticating ? 'pulse-auth border-[#00D1FF]/50' : ''}`}
            >
              <div className="flex flex-col items-end mr-1 hidden xs:flex">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Verified</span>
                <span className="text-[10px] font-mono text-slate-300 leading-none">
                  {publicKey.toBase58().slice(0, 4)}..{publicKey.toBase58().slice(-4)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white border border-white/10 shadow-inner">
                 {isAuthenticating ? <i className="fa-solid fa-circle-notch animate-spin text-xs"></i> : <i className="fa-solid fa-user-shield text-xs text-[#00D1FF]"></i>}
              </div>
            </button>
            
            {showProfile && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfile(false)}></div>
                <div className="absolute right-0 mt-3 w-72 bg-zinc-900 border border-white/10 p-2 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-white/5 bg-white/2 rounded-t-xl">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-black text-[#00D1FF] uppercase tracking-[0.2em]">Active Session</p>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#00D1FF]">
                        <i className="fa-solid fa-wallet"></i>
                      </div>
                      <div>
                        <p className="text-xl font-black text-white italic leading-none">{profile?.balance || '5.42'} <span className="text-[10px] text-slate-500">SOL</span></p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Available Assets</p>
                      </div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center justify-between group cursor-pointer" onClick={copyAddress}>
                      <p className="text-[9px] font-mono text-slate-400 truncate mr-4">{publicKey.toBase58()}</p>
                      <span className="text-slate-500 group-hover:text-white transition-colors">
                        {copied ? <i className="fa-solid fa-check text-green-400"></i> : <i className="fa-solid fa-copy"></i>}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={onLockVault}
                      className="w-full flex items-center gap-3 px-4 py-3 text-amber-400 font-bold text-xs hover:bg-amber-500/10 rounded-xl transition-all group"
                    >
                      <i className="fa-solid fa-lock text-sm group-hover:scale-110 transition-transform"></i>
                      Lock Vault Session
                    </button>
                    <button 
                      onClick={() => { disconnect(); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-all group"
                    >
                      <i className="fa-solid fa-power-off text-sm group-hover:scale-110 transition-transform"></i>
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button 
            onClick={onAuthTrigger}
            className={`px-6 py-2 bg-[#00D1FF] text-black font-black text-sm rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(0,209,255,0.25)] ${shakingItem ? 'pulse-auth scale-105' : ''} uppercase italic`}
          >
            {isAuthenticating ? 'Handshake...' : 'Initialize'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default TopNav;