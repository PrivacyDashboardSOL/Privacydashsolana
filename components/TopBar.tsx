
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { UserProfile } from '../types';
import { useWallet } from '@solana/wallet-adapter-react';

interface TopBarProps {
  network: string;
  profile: UserProfile | null;
  isAuthenticating: boolean;
  searchQuery: string;
  onSearch: (val: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  network, 
  profile,
  isAuthenticating,
  searchQuery,
  onSearch
}) => {
  const { connected, disconnect, publicKey, select, wallets, connect } = useWallet();
  const [showMenu, setShowMenu] = useState(false);

  const handleConnect = async () => {
    try {
      const phantom = wallets.find(w => w.adapter.name === 'Phantom');
      if (phantom) {
        await select(phantom.adapter.name);
        // The wallet provider auto-connects or we can call connect()
        await connect();
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (err) {
      console.error("Connection failed", err);
    }
  };

  const shortAddress = profile ? `${profile.pubkey.slice(0, 4)}...${profile.pubkey.slice(-4)}` : 
                       publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : '';

  return (
    <header className="h-20 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0 sticky top-0 z-50">
      <div className="flex-1 max-w-xl relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          {ICONS.Search}
        </div>
        <input 
          type="text"
          placeholder="Search requests by label, amount, or status..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent border focus:border-indigo-500 rounded-xl outline-none transition-all text-sm font-medium"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 bg-green-50 text-green-700">
          MAINNET
        </div>

        {connected && publicKey ? (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 pl-4 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all group"
            >
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 leading-tight">{shortAddress}</p>
                <p className="text-[10px] font-bold text-slate-400">
                  {profile ? `${profile.balance.toFixed(2)} SOL` : 'Authenticated'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <i className="fa-solid fa-ghost"></i>
              </div>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="p-4 border-b border-slate-50 mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated Phantom</p>
                  <p className="text-xs font-mono font-medium text-slate-900 break-all leading-relaxed">{publicKey.toBase58()}</p>
                </div>
                <button 
                  onClick={() => { setShowMenu(false); disconnect(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout Phantom
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {isAuthenticating && (
              <div className="flex items-center gap-2 text-indigo-600">
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Signing...</span>
              </div>
            )}
            <button 
              onClick={handleConnect}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <i className="fa-solid fa-ghost"></i> Connect Phantom
            </button>
          </div>
        )}

        <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          {ICONS.Export}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
