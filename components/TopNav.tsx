
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';
import { useWallet } from '@solana/wallet-adapter-react';
import { UserProfile } from '../types';

interface TopNavProps {
  profile: UserProfile | null;
}

const TopNav: React.FC<TopNavProps> = ({ profile }) => {
  const { connected, disconnect, publicKey, select, wallets, connect } = useWallet();
  const [showProfile, setShowProfile] = useState(false);

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

  return (
    <nav className="h-24 px-12 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl fixed top-0 w-full z-50">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00D1FF] rounded-lg shadow-[0_0_20px_rgba(0,209,255,0.4)] flex items-center justify-center">
            <i className="fa-solid fa-ghost text-black text-sm"></i>
          </div>
          <span className="font-black text-xl tracking-tighter italic">PRIVACY DASH</span>
        </div>

        <div className="flex items-center gap-10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-xs font-black tracking-widest transition-all hover:text-[#00D1FF] flex items-center gap-2 ${
                  isActive ? 'nav-tab-active' : 'text-slate-500'
                }`
              }
            >
              <span className="opacity-50">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mainnet Status</p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] font-bold text-green-400">ENCRYPTED SESSION</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10"></div>

        {connected && publicKey ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-[#00D1FF]/50 transition-all"
            >
              <div className="text-right">
                <p className="text-[10px] font-black text-white">{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</p>
                <p className="text-[10px] font-bold text-[#00D1FF]">{profile?.balance.toFixed(2) || '0.00'} SOL</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center overflow-hidden">
                 <i className="fa-solid fa-user-ninja text-xs"></i>
              </div>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-4 w-64 bg-slate-900 border border-white/10 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Authenticated Phantom</p>
                  <p className="text-[10px] font-mono break-all text-slate-300">{publicKey.toBase58()}</p>
                </div>
                <button 
                  onClick={() => disconnect()}
                  className="w-full mt-2 py-3 text-red-400 text-[10px] font-black hover:bg-red-500/10 rounded-xl transition-all uppercase"
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
            CONNECT PHANTOM
          </button>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
