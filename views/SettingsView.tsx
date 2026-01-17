
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { resetMasterKey } from '../services/crypto';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ profile }) => {
  const [autoLock, setAutoLock] = useState(30);

  if (!profile) return <Navigate to="/" />;

  const handleClearCache = () => {
    if (confirm("CRITICAL WARNING: Terminating the Master Key will render all previous data streams permanent inaccessible. Proceed with termination?")) {
      resetMasterKey();
      alert("MASTER KEY TERMINATED. SYSTEM RELOAD INITIATED.");
      window.location.reload();
    }
  };

  const handleExportBackup = () => {
    const key = localStorage.getItem('privacy_dash_master_key');
    const blob = new Blob([key || ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-dash-vault-key.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20 animate-in fade-in duration-700">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase">System_Config</h2>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Core protocol and security parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="premium-panel overflow-hidden border-t-2 border-t-[#00D1FF]">
          <div className="p-8 border-b border-white/5 bg-white/2 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center accent-glow">
              <i className="fa-solid fa-ghost"></i>
            </div>
            <h3 className="text-xs font-black tracking-widest uppercase">Relay Identity</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Public Key</h4>
              <div className="bg-black/40 p-5 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 break-all">
                {profile.pubkey}
              </div>
            </div>
            <div className="flex justify-between items-center bg-white/2 p-5 rounded-xl border border-white/5">
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Age</h4>
                <p className="text-xs font-black text-white italic mt-1">ESTABLISHED {new Date(profile.lastLoginAt).toLocaleTimeString()}</p>
              </div>
              <div className="px-3 py-1 bg-green-500/10 text-green-400 text-[8px] font-black rounded-md border border-green-500/20">STABLE</div>
            </div>
          </div>
        </section>

        <section className="premium-panel overflow-hidden border-t-2 border-t-purple-500">
          <div className="p-8 border-b border-white/5 bg-white/2 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <i className="fa-solid fa-vault"></i>
            </div>
            <h3 className="text-xs font-black tracking-widest uppercase">Encryption Vault</h3>
          </div>
          <div className="p-8 space-y-10">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="text-sm font-black text-white italic tracking-tighter">VAULT KEY BACKUP</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 leading-relaxed">Extract your AES-256 master key for cross-terminal recovery.</p>
              </div>
              <button 
                onClick={handleExportBackup}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase"
              >
                Extract Key
              </button>
            </div>

            <div className="flex items-center justify-between gap-6 border-t border-white/5 pt-10">
              <div className="flex-1">
                <h4 className="text-sm font-black text-red-500 italic tracking-tighter">DATA TERMINATION</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 leading-relaxed">Wipe all local keys and cache. Permanent action.</p>
              </div>
              <button 
                onClick={handleClearCache}
                className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-500 transition-all uppercase"
              >
                Flush Cache
              </button>
            </div>
          </div>
        </section>

        <section className="premium-panel lg:col-span-2 overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/2 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <h3 className="text-xs font-black tracking-widest uppercase">Operational Parameters</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
              <div>
                <h4 className="text-sm font-black text-white italic tracking-tighter">AUTO-LOCK SEQUENCE</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Automatic vault isolation on idle</p>
              </div>
              <select 
                value={autoLock}
                onChange={(e) => setAutoLock(Number(e.target.value))}
                className="bg-black/40 border border-white/10 px-5 py-3 rounded-xl font-black text-xs text-[#00D1FF] outline-none hover:border-[#00D1FF]/50 transition-all cursor-pointer"
              >
                <option value={5}>05 MIN</option>
                <option value={15}>15 MIN</option>
                <option value={30}>30 MIN</option>
                <option value={60}>60 MIN</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
              <div>
                <h4 className="text-sm font-black text-white italic tracking-tighter">MAINNET PROTOCOL</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Mandatory Solana Pay compliance</p>
              </div>
              <div className="w-14 h-7 bg-[#00D1FF] rounded-full relative shadow-[0_0_15px_rgba(0,209,255,0.4)]">
                <div className="absolute right-1 top-1 w-5 h-5 bg-black rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="p-8 pt-0">
             <div className="bg-[#00D1FF]/5 border border-[#00D1FF]/10 rounded-2xl p-6 flex gap-6 items-center">
                <div className="text-3xl text-[#00D1FF] accent-glow"><i className="fa-solid fa-shield-halved"></i></div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">Advanced Integrity Enabled</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">This system leverages the Phantom Relay Bridge for all high-value asset transfers on Mainnet-Beta. No private keys are ever stored on-server.</p>
                </div>
             </div>
          </div>
        </section>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.8em]">Privacy Dash // Revision 4.2.0-Alpha</p>
      </div>
    </div>
  );
};

export default SettingsView;
