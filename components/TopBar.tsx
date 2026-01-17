
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
        await connect();
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (err) {
      console.error("Connection failed", err);
    }
  };

  return (
    <header className="h-20 bg-slate-900 border-b-4 border-slate-800 px-10 flex items-center justify-between shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tighter">
            COMMAND CENTER
        </h2>
        <div className="h-8 w-[2px] bg-slate-700 bevel-border"></div>
        <div className="relative w-96 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                {ICONS.Search}
            </div>
            <input 
                type="text"
                placeholder="TERMINAL SEARCH..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border-2 border-slate-700 focus:border-[#2D6BFF] outline-none text-xs font-black tracking-widest text-white transition-all"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Network Status</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-xs font-black text-white italic">MAINNET-BETA</span>
            </div>
        </div>

        <div className="h-10 w-[2px] bg-slate-700 bevel-border"></div>

        {connected && publicKey ? (
            <div className="relative">
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-4 px-4 py-2 bg-slate-800 border-2 border-slate-700 hover:border-[#2D6BFF] transition-all group bevel-border"
                >
                    <div className="text-right">
                        <p className="text-xs font-black text-white leading-tight">AUTH: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</p>
                        <p className="text-[10px] font-bold text-[#2D6BFF]">CRYPTO ASSETS LOADED</p>
                    </div>
                    <div className="w-8 h-8 bg-slate-700 flex items-center justify-center text-white border border-slate-500">
                        <i className="fa-solid fa-user-secret"></i>
                    </div>
                </button>
                {showMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border-4 border-slate-800 shadow-2xl p-4 z-50">
                        <button 
                            onClick={() => disconnect()}
                            className="w-full py-3 bg-red-900/50 border-2 border-red-700 text-white font-black italic text-xs hover:bg-red-800 transition-all uppercase tracking-widest"
                        >
                            Deactivate Session
                        </button>
                    </div>
                )}
            </div>
        ) : (
            <button 
                onClick={handleConnect}
                className="px-8 py-3 bg-[#2D6BFF] text-white font-black italic tracking-tighter hover:bg-[#1e5ae6] transition-all bevel-border shadow-[0_4px_10px_rgba(0,0,0,0.3)] active:translate-y-1"
            >
                INITIALIZE PHANTOM
            </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
