import React, { useState, useEffect } from 'react';
import { MockBackend } from '../services/mockBackend';
import { Stats, SolanaPayRequest, UserProfile, RequestStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import { resetMasterKey } from '../services/crypto';

interface DashboardViewProps {
  profile: UserProfile;
}

const DashboardView: React.FC<DashboardViewProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<SolanaPayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rpcPing, setRpcPing] = useState(12);

  const loadData = async () => {
    const [s, r] = await Promise.all([
      MockBackend.getStats(profile.pubkey),
      MockBackend.getAllRequests(profile.pubkey)
    ]);
    setStats(s);
    setRecent(r.slice(0, 6));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
      setRpcPing(Math.floor(Math.random() * 15) + 8);
    }, 10000);
    return () => clearInterval(interval);
  }, [profile]);

  const handleCreateDemo = async () => {
    await MockBackend.createDemoRequest(profile.pubkey);
    loadData();
  };

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLockSession = () => {
    window.location.reload();
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

  const handleWipe = () => {
    if (confirm("CRITICAL: Wipe all local keys and encrypted archives? This action is permanent.")) {
      resetMasterKey();
      window.location.reload();
    }
  };

  const getExpiryText = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return "EXPIRED";
    const mins = Math.floor(remaining / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}H ${mins % 60}M`;
    return `${mins}M REMAINING`;
  };

  if (loading || !stats) return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Relay State...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Collected" 
          val={`${stats.totalCollected.toFixed(2)} SOL`} 
          icon="fa-vault" 
          trend="COMMITTED" 
          onClick={() => navigate('/requests', { state: { filter: RequestStatus.PAID }})}
        />
        <StatCard 
          label="Pending Requests" 
          val={stats.pendingRequests.toString()} 
          icon="fa-clock" 
          trend="ACTIVE QUEUE" 
          accent 
          onClick={() => navigate('/requests', { state: { filter: RequestStatus.PENDING }})}
        />
        <StatCard 
          label="Paid Today" 
          val={stats.paidToday.toString()} 
          icon="fa-bolt" 
          trend="SETTLED" 
          onClick={() => navigate('/receipts')}
        />
        <StatCard 
          label="Expiring Soon" 
          val={stats.expiringSoon.toString()} 
          icon="fa-hourglass-half" 
          trend="URGENT" 
          warning={stats.expiringSoon > 0}
          onClick={() => navigate('/requests', { state: { filter: 'EXPIRING_SOON' }})}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-[10px] font-black tracking-[0.5em] text-slate-400 uppercase leading-none mb-1">Transmission Logs</h3>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Real-time reference monitoring active</p>
            </div>
            <Link to="/requests" className="text-[10px] font-black text-[#00D1FF] hover:brightness-125 transition-all uppercase tracking-widest italic flex items-center gap-2 group">
              Historical Terminal <i className="fa-solid fa-arrow-right-long group-hover:translate-x-1 transition-transform"></i>
            </Link>
          </div>
          
          <div className="space-y-2">
            {recent.map(req => (
              <div key={req.id} className="premium-panel p-4 flex items-center justify-between group border-white/5 hover:border-[#00D1FF]/20 transition-all cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-lg overflow-hidden border border-white/10 shrink-0 group-hover:border-[#00D1FF]/40 transition-colors">
                    <img src={req.icon} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h5 className="font-black italic text-sm text-white tracking-tight">{req.label.toUpperCase()}</h5>
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border ${
                        req.status === RequestStatus.PAID 
                          ? 'border-green-500/30 text-green-400 bg-green-500/5' 
                          : req.status === RequestStatus.PENDING 
                            ? 'border-[#00D1FF]/30 text-[#00D1FF] bg-[#00D1FF]/5'
                            : 'border-slate-500/30 text-slate-400'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase">REF: {req.id.slice(0, 8)}</p>
                      <span className="text-slate-700 text-[6px]">•</span>
                      <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-black text-white italic tracking-tighter leading-none">{req.amount} <span className="text-[9px] text-slate-500 uppercase not-italic">SOL</span></p>
                    {req.status === RequestStatus.PENDING && (
                      <p className="text-[7px] font-black text-amber-500 uppercase tracking-widest mt-1">{getExpiryText(req.expiresAt)}</p>
                    )}
                    {req.status === RequestStatus.PAID && (
                       <a href={`https://solscan.io/tx/${req.signature}`} target="_blank" className="text-[7px] font-black text-[#00D1FF] uppercase hover:underline mt-1 block tracking-tighter">Chain Signature</a>
                    )}
                  </div>
                  
                  {req.status === RequestStatus.PENDING && (
                    <button 
                      onClick={(e) => handleCopyLink(e, req.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/2 border border-white/5 text-slate-500 hover:text-[#00D1FF] hover:border-[#00D1FF]/40 transition-all"
                      title="Copy Link"
                    >
                      {copiedId === req.id ? <i className="fa-solid fa-check text-green-400"></i> : <i className="fa-solid fa-link text-xs"></i>}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <div className="p-16 text-center border border-dashed border-white/5 rounded-2xl flex flex-col items-center">
                <i className="fa-solid fa-radar text-slate-800 text-3xl mb-4"></i>
                <p className="text-slate-500 font-black italic uppercase tracking-[0.3em] text-[10px]">Awaiting first relay transmission</p>
                <div className="flex gap-3 mt-6">
                   <Link to="/create" className="px-6 py-2 bg-[#00D1FF] text-black font-black text-[10px] rounded-lg hover:brightness-110 uppercase tracking-widest transition-all">Create Request</Link>
                   <button onClick={handleCreateDemo} className="px-6 py-2 bg-white/5 border border-white/10 text-white font-bold text-[10px] rounded-lg hover:bg-white/10 uppercase tracking-widest transition-all">View Demo Request</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="premium-panel p-6 bg-black/40 border-white/10">
              <h3 className="text-[9px] font-black tracking-[0.4em] text-slate-500 uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse"></span> Network Integrity
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">RPC Node Ping</span>
                  <span className="text-[10px] font-mono text-[#00D1FF]">{rpcPing}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Index State</span>
                  <span className="text-[10px] font-mono text-green-400">SYNCED_PROXIED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Relay Path</span>
                  <span className="text-[10px] font-mono text-white">MAINNET-BETA</span>
                </div>
                <div className="pt-2 border-t border-white/5">
                   <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase mb-1.5">
                      <span>Monitoring Load</span>
                      <span>{Math.floor(rpcPing * 1.5)}%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00D1FF] transition-all duration-1000" style={{ width: `${rpcPing * 1.5}%` }}></div>
                   </div>
                </div>
              </div>
           </div>

           <div className="premium-panel overflow-hidden border-[#00D1FF]/10">
              <div className="p-6 bg-gradient-to-br from-[#00D1FF]/10 to-transparent border-b border-white/5">
                <div className="flex items-center gap-3 mb-1">
                  <i className="fa-solid fa-user-shield text-[#00D1FF]"></i>
                  <h6 className="font-black text-white italic tracking-tighter uppercase text-sm">Vault Command</h6>
                </div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">AES-256-GCM LOCAL ARCHIVE</p>
              </div>
              
              <div className="p-4 space-y-2">
                <button onClick={handleLockSession} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 group transition-all">
                  <span className="text-[10px] font-black text-slate-300 uppercase group-hover:text-amber-400 transition-colors">Lock Session</span>
                  <i className="fa-solid fa-lock text-[10px] text-slate-600 group-hover:text-amber-400"></i>
                </button>
                <button onClick={handleExportBackup} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-[#00D1FF]/30 hover:bg-[#00D1FF]/5 group transition-all">
                  <span className="text-[10px] font-black text-slate-300 uppercase group-hover:text-[#00D1FF] transition-colors">Export Vault</span>
                  <i className="fa-solid fa-download text-[10px] text-slate-600 group-hover:text-[#00D1FF]"></i>
                </button>
                <button onClick={handleWipe} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 group transition-all">
                  <span className="text-[10px] font-black text-slate-300 uppercase group-hover:text-red-400 transition-colors">Flush Cache</span>
                  <i className="fa-solid fa-trash text-[10px] text-slate-600 group-hover:text-red-400"></i>
                </button>
              </div>
           </div>

           <Link to="/create" className="block p-8 rounded-2xl bg-gradient-to-br from-[#00D1FF] to-[#00D1FF]/80 text-black group hover:scale-[1.02] transition-all shadow-[0_10px_40px_rgba(0,209,255,0.2)]">
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center text-3xl">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <i className="fa-solid fa-chevron-right opacity-40 group-hover:translate-x-1 transition-transform"></i>
              </div>
              <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">New Relay</h4>
              <p className="text-[10px] font-black uppercase mt-2 opacity-60">Initialize private invoice protocol</p>
           </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon, trend, accent, warning, onClick }: any) => (
  <div onClick={onClick} className={`premium-panel p-6 flex flex-col justify-between border-b-2 transition-all cursor-pointer group hover:translate-y-[-2px] ${accent ? 'border-b-[#00D1FF] hover:border-[#00D1FF]' : warning ? 'border-b-amber-500 hover:border-amber-500' : 'border-b-white/10 hover:border-white/30'}`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${accent ? 'bg-[#00D1FF]/10 text-[#00D1FF]' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded ${warning ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-500 group-hover:text-white transition-colors'}`}>
        {trend}
      </span>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 group-hover:text-slate-400 transition-colors tracking-widest uppercase mb-1">{label}</p>
      <h3 className={`text-2xl font-black italic tracking-tighter text-white`}>{val}</h3>
    </div>
  </div>
);

export default DashboardView;