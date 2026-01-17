
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: ICONS.Dashboard },
    { name: 'Create Request', path: '/create', icon: ICONS.Create },
    { name: 'Requests', path: '/requests', icon: ICONS.Requests },
    { name: 'Receipts', path: '/receipts', icon: ICONS.Receipts },
    { name: 'Settings', path: '/settings', icon: ICONS.Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 hidden md:flex">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <i className="fa-solid fa-shield-halved text-white text-lg"></i>
          </div>
          <h1 className="text-xl font-black tracking-tight">Privacy Dash</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-1' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-bold text-sm tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">Environment Status</p>
          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            Mainnet Beta Active
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            AES-GCM Local Keys Ready
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
