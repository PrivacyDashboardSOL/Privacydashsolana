import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';
import { useWallet } from '@solana/wallet-adapter-react';
import { UserProfile } from '../types';

interface TopNavProps {
  profile: UserProfile | null;
  searchQuery: string;
  onSearch: (val: string) => void;
  onAuthTrigger: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ profile, searchQuery, onSearch, onAuthTrigger }) => {
  const { connected, disconnect, publicKey } = useWallet();
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: ICONS.Dashboard },
    { name: 'Create', path: '/create', icon: ICONS.Create },
    { name: 'History', path: '/requests', icon: ICONS.Requests },
    { name: 'Receipts', path: '/receipts', icon: ICONS.Receipts },
    { name: 'Settings', path: '/settings', icon: ICONS.Settings },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (!profile && path !== '/') {
      e.preventDefault();
      onAuthTrigger();
    }
  };

  const handleExportBackup = () => {
    const key = localStorage.getItem('privacy_dash_master_key');
    if (!key) return alert("Vault not initialized");
    const blob = new Blob([key], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-dash-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <nav className="h-16 px-6 flex items-center border-b border-white/10 bg-black fixed top-0 w-full z-[100] backdrop-blur-md">
      {/* Brand - Logo Only - Sized Larger */}
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
            onClick={(e) => handleNavClick(e, item.path)}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5 flex items-center gap-2 whitespace-nowrap ${
                (isActive && profile) ? 'text-[#00D1FF] bg-[#00D1FF]/10' : 'text-slate-400'
              }`
            }
          >
            <span className="opacity-80">{item.icon}</span>
            <span className="hidden md:block">{item.name}</span>
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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white focus:border-[#00D1FF]/50 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        <button 
          onClick={handleExportBackup}
          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00D1FF] transition-all"
          title="Backup Vault"
        >
          <span className="text-base">{ICONS.Export}</span>
        </button>

        {connected && publicKey ? (
          <div className="relative shrink-0">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-cyan-500/50 transition-all"
            >
              <span className="text-xs font-mono text-slate-300">
                {publicKey.toBase58().slice(0, 4)}..{publicKey.toBase58().slice(-4)}
              </span>
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white border border-white/10">
                 <i className="fa-solid fa-user text-[10px]"></i>
              </div>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 p-1 rounded-xl shadow-xl z-50">
                <div className="p-3 border-b border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Wallet Address</p>
                  <p className="text-xs font-mono break-all text-slate-300">{publicKey.toBase58()}</p>
                </div>
                <button 
                  onClick={() => { disconnect(); setShowProfile(false); }}
                  className="w-full py-2 text-red-400 font-semibold text-xs hover:bg-red-500/10 rounded-lg transition-all"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onAuthTrigger}
            className="px-4 py-2 bg-[#00D1FF] text-black font-bold text-sm rounded-lg hover:brightness-110 transition-all"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default TopNav;