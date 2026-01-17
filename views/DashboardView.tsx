import React, { useState, useEffect } from 'react';
import { MockBackend } from '../services/mockBackend';
import { Stats, SolanaPayRequest, UserProfile, RequestStatus } from '../types';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

interface DashboardViewProps {
  profile: UserProfile;
}

const DashboardView: React.FC<DashboardViewProps> = ({ profile }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<SolanaPayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [s, r] = await Promise.all([
        MockBackend.getStats(profile.pubkey),
        MockBackend.getAllRequests(profile.pubkey)
      ]);
      setStats(s);
      setRecent(r.slice(0, 8));
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [profile]);

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getExpiryText = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return "EXPIRED";
    const mins = Math.floor(remaining / 60000);
    const hours = Math.floor(mins / 600);
    if (hours > 0) return `${hours}H ${mins % 60}M`;
    return `${mins}M REMAINING`;
  };

  if (loading || !stats) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin text-4xl text-[#00D1FF]"><i className="fa-solid fa-circle-notch"></i></div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 slide-in-from-bottom-5">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Collected" 
          val={`${stats.totalCollected.toFixed(2)} SOL`} 
          icon="fa-vault" 
          trend="COMMITTED" 
        />
        <StatCard 
          label="Pending Requests" 
          val={stats.pendingRequests.toString()} 
          icon="fa-clock" 
          trend="ACTIVE QUEUE" 
        />
        <StatCard 
          label="Paid Today" 
          val={stats.paidToday.toString()} 
          icon="fa-bolt" 
          trend="SETTLED" 
          accent 
        />
        <StatCard 
          label="Expiring Soon" 
          val={stats.expiringSoon.toString()} 
          icon="fa-hourglass-half" 
          trend="URGENT" 
          warning={stats.expiringSoon > 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black tracking-[0.5em] text-slate-300 uppercase">System Transmission Logs</h3>
            <Link to="/requests" className="text-[10px] font-black text-[#00D1FF] hover:underline uppercase tracking-widest italic">Open History Terminal</Link>
          </div>
          
          <div className="space-y-3">
            {recent.map(req => (
              <div key={req.id} className="premium-panel light-sweep p-5 flex items-center justify-between group border-white/5 hover:border-white/10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-black rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
                    <img src={req.icon} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h5 className="font-black italic text-base text-white">{req.label.toUpperCase()}</h5>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                        req.status === RequestStatus.PAID 
                          ? 'border-green-500/30 text-green-400 bg-green-500/5' 
                          : req.status === RequestStatus.PENDING 
                            ? 'border-[#00D1FF]/30 text-[#00D1FF] bg-[#00D1FF]/5'
                            : 'border-slate-500/30 text-slate-300'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 tracking-widest mt-1">
                      {req.id.toUpperCase()} • {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  {req.status === RequestStatus.PAID ? (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-black text-white italic tracking-tighter">{req.amount} <span className="text-[10px] text-slate-400">SOL</span></p>
                        <a 
                          href={`https://solscan.io/tx/${req.signature}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[8px] font-black text-green-400 hover:underline uppercase tracking-widest"
                        >
                          View Signature
                        </a>
                      </div>
                    </div>
                  ) : req.status === RequestStatus.PENDING ? (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-black text-white italic tracking-tighter">{req.amount} <span className="text-[10px] text-slate-400">SOL</span></p>
                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{getExpiryText(req.expiresAt)}</p>
                      </div>
                      <button 
                        onClick={(e) => handleCopyLink(e, req.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-[#00D1FF] hover:border-[#00D1FF]/40 transition-all"
                        title="Copy Payment Link"
                      >
                        {copiedId === req.id ? <i className="fa-solid fa-check text-green-400"></i> : <i className="fa-solid fa-link text-xs"></i>}
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-400 italic tracking-tighter">{req.amount} SOL</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <div className="p-20 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-slate-400 font-black italic uppercase tracking-widest text-xs">No activity detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Panels */}
        <div className="space-y-8">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black tracking-[0.5em] text-slate-300 uppercase px-2">Privacy Status</h3>
              <div className="premium-panel p-8 space-y-6 border-l-2 border-l-[#00D1FF]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00D1FF]/10 rounded-2xl flex items-center justify-center text-[#00D1FF] shadow-[0_0_20px_rgba(0,209,255,0.1)]">
                    <i className="fa-solid fa-shield-halved text-xl"></i>
                  </div>
                  <div>
                    <h6 className="font-black text-white italic tracking-tighter uppercase text-sm">Vault Engaged</h6>
                    <p className="text-[8px] text-green-400 font-black uppercase tracking-widest">AES-256-GCM ACTIVE</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                   <div className="flex gap-3">
                      <i className="fa-solid fa-check text-[#00D1FF] text-[10px] mt-1"></i>
                      <p className="text-[10px] text-slate-200 font-bold uppercase leading-relaxed">Invoice details are encrypted locally in your browser context.</p>
                   </div>
                   <div className="flex gap-3">
                      <i className="fa-solid fa-check text-[#00D1FF] text-[10px] mt-1"></i>
                      <p className="text-[10px] text-slate-200 font-bold uppercase leading-relaxed">Public fields are limited to what wallets must display for payments.</p>
                   </div>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                   <div className="flex justify-between items-center text-[9px] font-black">
                      <span className="text-slate-300 uppercase">Local Key State</span>
                      <span className="text-green-400">PERSISTED</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00D1FF] w-full shadow-[0_0_10px_#00D1FF]"></div>
                   </div>
                </div>
              </div>
           </div>

           <Link to="/create" className="block premium-panel p-8 bg-gradient-to-br from-[#00D1FF]/10 to-transparent border-[#00D1FF]/20 group hover:scale-[1.02]">
              <div className="flex justify-between items-center mb-6">
                <i className="fa-solid fa-plus-circle text-3xl text-[#00D1FF]"></i>
                <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-white transition-colors"></i>
              </div>
              <h4 className="text-xl font-black italic text-white tracking-tighter uppercase">Initialize Request</h4>
              <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">Deploy a new privacy-guaranteed Solana Pay invoice.</p>
           </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon, trend, accent, warning }: any) => (
  <div className={`premium-panel p-6 flex flex-col justify-between border-b-2 ${
    accent ? 'border-b-[#00D1FF]' : warning ? 'border-b-amber-500' : 'border-b-white/10'
  }`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
        accent ? 'bg-[#00D1FF]/10 text-[#00D1FF]' : 'bg-white/5 text-slate-300'
      }`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded ${
        warning ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-300'
      }`}>
        {trend}
      </span>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase mb-1">{label}</p>
      <h3 className={`text-2xl font-black italic tracking-tighter ${accent ? 'text-white' : 'text-white'}`}>{val}</h3>
    </div>
  </div>
);

export default DashboardView;