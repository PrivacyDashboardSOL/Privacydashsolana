import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { resetMasterKey } from '../services/crypto';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ profile }) => {
  const [autoLock, setAutoLock] = useState(30);
  const [persisted, setPersisted] = useState(true);
  const [lastUnlocked, setLastUnlocked] = useState<string>('');

  useEffect(() => {
    setLastUnlocked(new Date().toLocaleTimeString());
  }, []);

  if (!profile) return <Navigate to="/" />;

  const handleClearCache = () => {
    if (confirm("CRITICAL WARNING: Terminating the Master Key will render all previous data streams permanently inaccessible. Proceed?")) {
      resetMasterKey();
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
        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase tracking-tight">System_Config</h2>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Core protocol and security parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="premium-panel overflow-hidden border-t-2 border-t-[#00D1FF]">
          <div className="p-8 border-b border-white/5 bg-white/2 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden p-2">
              <img 
                src="https://i.postimg.cc/QdKmjG6X/Untitled-design-(47).png" 
                className="w-full h-full object-contain" 
                alt="Privacy Dash Logo" 
              />
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
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Last Unlocked</h4>
                <p className="text-xs font-black text-white italic mt-1 uppercase">{lastUnlocked}</p>
              </div>
              <div className="px-3 py-1 bg-green-500/10 text-green-400 text-[8px] font-black rounded-md border border-green-500/20">VERIFIED</div>
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
                <h4 className="text-sm font-black text-white italic tracking-tighter uppercase">Vault Key Backup</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 leading-relaxed">Extract your AES-256 master key for cross-terminal recovery.</p>
              </div>
              <button 
                onClick={handleExportBackup}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase italic tracking-widest"
              >
                Extract Key
              </button>
            </div>

            <div className="flex items-center justify-between gap-6 border-t border-white/5 pt-10">
              <div className="flex-1">
                <h4 className="text-sm font-black text-red-500 italic tracking-tighter uppercase">Data Termination</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 leading-relaxed">Wipe all local keys and cache. Permanent action.</p>
              </div>
              <button 
                onClick={handleClearCache}
                className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-500 transition-all uppercase italic tracking-widest"
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
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="flex flex-col justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
              <div className="mb-4">
                <h4 className="text-sm font-black text-white italic tracking-tighter uppercase">Auto-Lock Sequence</h4>
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
              </select>
            </div>

            <div className="flex flex-col justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
              <div className="mb-4">
                <h4 className="text-sm font-black text-white italic tracking-tighter uppercase">Persisted Session</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Remain authorized after refresh</p>
              </div>
              <div 
                onClick={() => setPersisted(!persisted)}
                className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${persisted ? 'bg-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-black rounded-full transition-all ${persisted ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
              <div className="mb-4">
                <h4 className="text-sm font-black text-white italic tracking-tighter uppercase">Chain Monitor</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Last scan: 12s ago</p>
              </div>
              <div className="flex items-center gap-2 text-green-400 font-black text-[10px] uppercase">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 REFERENCE_INDEX_ACTIVE
              </div>
            </div>
          </div>
          
          <div className="p-8 pt-0">
             <div className="bg-[#00D1FF]/5 border border-[#00D1FF]/10 rounded-2xl p-6 flex gap-6 items-center">
                <div className="text-3xl text-[#00D1FF] accent-glow"><i className="fa-solid fa-shield-halved"></i></div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">Ciphertext Encryption Active</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">System utilizes AES-256-GCM. All record indexing happens within the secure terminal context of your browser.</p>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;