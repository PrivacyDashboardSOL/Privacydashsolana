
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'DASHBOARD', path: '/', icon: ICONS.Dashboard },
    { name: 'CREATE REQUEST', path: '/create', icon: ICONS.Create },
    { name: 'REQUEST HISTORY', path: '/requests', icon: ICONS.Requests },
    { name: 'RECEIPT STORAGE', path: '/receipts', icon: ICONS.Receipts },
    { name: 'SYSTEM CONFIG', path: '/settings', icon: ICONS.Settings },
  ];

  return (
    <aside className="w-72 bg-slate-900/50 flex flex-col border-r-4 border-slate-800 shrink-0 relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-8 pt-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2D6BFF] bevel-border flex items-center justify-center shadow-[0_0_15px_rgba(45,107,255,0.4)]">
              <i className="fa-solid fa-bolt text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white drop-shadow-lg">PRIVACY DASH</h1>
          </div>
          <div className="h-1 bg-slate-700 w-full mt-2 bevel-border"></div>
        </div>
      </div>
      
      <nav className="flex-1 mt-6">
        <div className="px-4 space-y-1">
          <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Modules</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 transition-all bevel-border ${
                  isActive 
                    ? 'console-selection-active text-white translate-x-2' 
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`
              }
            >
              <span className="text-xl opacity-80">{item.icon}</span>
              <span className="font-black text-sm tracking-tighter">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4">
        <div className="console-panel">
            <div className="console-panel-header">System Info</div>
            <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-500">ENCRYPTION</span>
                    <span className="text-green-400">ACTIVE</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-none overflow-hidden border border-slate-700">
                    <div className="h-full bg-[#2D6BFF] w-[85%]"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-500">SOLANA NET</span>
                    <span className="text-blue-400">MAINNET</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-none overflow-hidden border border-slate-700">
                    <div className="h-full bg-blue-500 w-[100%] animate-pulse"></div>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
