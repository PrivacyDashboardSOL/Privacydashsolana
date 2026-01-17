
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ICONS } from '../constants';
import { useWallet } from '@solana/wallet-adapter-react';
import { UserProfile } from '../types';

interface TopNavProps {
  profile: UserProfile | null;
  searchQuery: string;
  onSearch: (val: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ profile, searchQuery, onSearch }) => {
  const { connected, disconnect, publicKey, select, wallets, connect } = useWallet();
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'DASHBOARD', path: '/', icon: ICONS.Dashboard },
    { name: 'CREATE', path: '/create', icon: ICONS.Create },
    { name: 'HISTORY', path: '/requests', icon: ICONS.Requests },
    { name: 'RECEIPTS', path: '/receipts', icon: ICONS.Receipts },
    { name: 'CONFIG', path: '/settings', icon: ICONS.Settings },
  ];

  const handleConnect = async () => {
    const phantom = wallets.find(w => w.adapter.name === 'Phantom');
    if (phantom) {
      await select(phantom.adapter.name);
      await connect();
    }
  };

  const handleExportBackup = () => {
    const key = localStorage.getItem('privacy_dash_master_key');
    if (!key) return alert("VAULT NOT INITIALIZED");
    const blob = new Blob([key], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-dash-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <nav className="h-24 px-12 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl fixed top-0 w-full z-50">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-[#00D1FF] rounded-lg shadow-[0_0_20px_rgba(0,209,255,0.4)] flex items-center justify-center">
            <i className="fa-solid fa-ghost text-black text-sm"></i>
          </div>
          <span className="font-black text-xl tracking-tighter italic hidden xl:block">PRIVACY DASH</span>
        </div>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-[10px] font-black tracking-widest transition-all hover:text-[#00D1FF] flex items-center gap-2 ${
                  isActive ? 'nav-tab-active' : 'text-slate-500'
                }`
              }
            >
              <span className="opacity-50">{item.icon}</span>
              <span className="hidden lg:block">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 flex-1 justify-end max-w-4xl">
        <div className="relative w-full max-w-xs group hidden md:block">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors">
            {ICONS.Search}
          </div>
          <input 
            type="text"
            placeholder="FILTER TERMINAL..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black tracking-widest text-white focus:border-[#00D1FF] outline-none transition-all placeholder:text-slate-700"
          />
        </div>

        <button 
          onClick={handleExportBackup}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00D1FF] hover:border-[#00D1FF]/30 transition-all group"
          title="Export System Backup"
        >
          {ICONS.Export}
        </button>

        <div className="h-8 w-px bg-white/10 mx-2"></div>

        {connected && publicKey ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-[#00D1FF]/50 transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white">
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </p>
                <p className="text-[10px] font-bold text-[#00D1FF] uppercase tracking-tighter">
                  AUTHENTICATED
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                 <i className="fa-solid fa-user-secret text-xs"></i>
              </div>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-4 w-64 bg-slate-900 border border-white/10 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Active Identity</p>
                  <p className="text-[10px] font-mono break-all text-slate-300 bg-black/40 p-2 rounded-lg">
                    {publicKey.toBase58()}
                  </p>
                </div>
                <div className="p-4 flex justify-between items-center text-[10px] font-black">
                  <span className="text-slate-500">CREDITS</span>
                  <span className="text-[#00D1FF]">{profile?.balance.toFixed(2) || '0.00'} SOL</span>
                </div>
                <button 
                  onClick={() => { disconnect(); setShowProfile(false); }}
                  className="w-full mt-2 py-3 text-red-400 text-[10px] font-black hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
                >
                  Terminate Session
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={handleConnect}
            className="px-6 py-2.5 bg-[#00D1FF] text-black font-black text-xs italic tracking-tighter hover:scale-105 transition-all rounded-xl shadow-[0_0_20px_rgba(0,209,255,0.3)]"
          >
            INITIALIZE PHANTOM
          </button>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
