
import React, { useState, useEffect } from 'react';
import { MockBackend } from '../services/mockBackend';
import { Stats, SolanaPayRequest, UserProfile, RequestStatus } from '../types';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';
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
      setRecent(r.slice(0, 4));
      setLoading(false);
    }
    load();
  }, [profile]);

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || !stats) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin text-4xl text-[#00D1FF]"><i className="fa-solid fa-circle-notch"></i></div>
    </div>
  );

  const chartData = [
    { name: '01', val: 10 }, { name: '02', val: 35 }, { name: '03', val: 20 },
    { name: '04', val: 55 }, { name: '05', val: 30 }, { name: '06', val: Math.max(stats.totalCollected * 10, 40) }
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20 animate-in fade-in duration-700 slide-in-from-bottom-5">
      {/* KPI Stats Strip */}
      <div className="flex flex-wrap items-center gap-8 md:gap-12 border-b border-white/5 pb-8">
        <KPIItem label="SESSIONS" val="ACTIVE" color="text-green-400" />
        <div className="hidden md:block w-px h-8 bg-white/5"></div>
        <KPIItem label="NETWORK" val="MAINNET" color="text-[#00D1FF]" />
        <div className="hidden md:block w-px h-8 bg-white/5"></div>
        <KPIItem label="THROUGHPUT" val="100%" color="text-white" />
        <div className="hidden md:block w-px h-8 bg-white/5"></div>
        <KPIItem label="ENCRYPTION" val="AES-256" color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Large Hero Tile */}
        <Link to="/create" className="xl:col-span-2 group relative light-sweep premium-panel p-10 h-[420px] flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700">
            <i className="fa-solid fa-plus-circle text-[180px] text-[#00D1FF]"></i>
          </div>
          <div>
            <h4 className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase mb-4">Module_01</h4>
            <h2 className="text-6xl font-black italic tracking-tighter text-white">INITIALIZE<br/>NEW REQUEST</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 bg-[#00D1FF] text-black font-black text-xs rounded-lg uppercase tracking-widest">Deploy Now</div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ready for transaction relay</p>
          </div>
        </Link>

        {/* Analytics Hero Tile */}
        <div className="xl:col-span-2 premium-panel p-10 h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h4 className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase mb-4">Module_02 // Analytics</h4>
              <div className="text-right">
                <p className="text-3xl font-black text-white italic">{stats.totalCollected.toFixed(2)} SOL</p>
                <p className="text-[10px] font-bold text-[#00D1FF] uppercase">Total Volume</p>
              </div>
            </div>
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="val" stroke="#00D1FF" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-2xl font-black text-white italic">{stats.paidToday}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Settled Today</span>
             </div>
             <div className="w-px h-8 bg-white/5"></div>
             <div className="flex flex-col">
                <span className="text-2xl font-black text-white italic">{stats.pendingRequests}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Queue Size</span>
             </div>
          </div>
        </div>
      </div>

      {/* Activity and Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black tracking-[0.5em] text-slate-500 uppercase">Recent System Activity</h3>
            <Link to="/requests" className="text-[10px] font-black text-[#00D1FF] hover:underline uppercase tracking-widest">View All Records</Link>
          </div>
          <div className="space-y-4">
            {recent.map(req => (
              <Link key={req.id} to={`/pay/${req.id}`} className="premium-panel light-sweep p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-[#00D1FF]/50 transition-colors">
                    <img src={req.icon} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h5 className="font-black italic text-lg text-white group-hover:text-[#00D1FF] transition-colors">{req.label.toUpperCase()}</h5>
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest">{req.id.toUpperCase()} // STATUS: {req.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tighter italic">{req.amount} <span className="text-xs text-slate-500">SOL</span></p>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-md border ${req.status === RequestStatus.PAID ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-[#00D1FF]/30 text-[#00D1FF] bg-[#00D1FF]/5'}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.status === RequestStatus.PENDING && (
                    <button 
                      onClick={(e) => handleCopyLink(e, req.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-[#00D1FF] hover:border-[#00D1FF]/40 transition-all"
                    >
                      {copiedId === req.id ? <i className="fa-solid fa-check text-green-400"></i> : ICONS.Copy}
                    </button>
                  )}
                </div>
              </Link>
            ))}
            {recent.length === 0 && <div className="p-10 text-center text-slate-500 uppercase text-xs font-black tracking-widest border border-dashed border-white/10 rounded-2xl">Buffer empty</div>}
          </div>
        </div>

        <div className="space-y-8">
           <h3 className="text-xs font-black tracking-[0.5em] text-slate-500 uppercase">Security Details</h3>
           <div className="premium-panel p-8 space-y-8 border-l-2 border-l-[#00D1FF]">
              <div className="flex flex-col items-center py-6">
                <div className="w-20 h-20 bg-[#00D1FF]/10 rounded-full flex items-center justify-center text-3xl text-[#00D1FF] accent-glow mb-4">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <h6 className="font-black text-white italic tracking-tighter uppercase">Vault Engaged</h6>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 text-center leading-relaxed">Invoice descriptors are isolated<br/>within the browser's sandbox.</p>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <span className="text-[10px] font-black text-slate-500">CLIENT ID</span>
                    <span className="text-[10px] font-mono text-white">{profile.pubkey.slice(0, 12)}...</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <span className="text-[10px] font-black text-slate-500">MASTER KEY</span>
                    <span className="text-[10px] font-bold text-green-400">VERIFIED</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KPIItem = ({ label, val, color }: any) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-1">{label}</span>
    <span className={`text-xl font-black italic tracking-tighter ${color}`}>{val}</span>
  </div>
);

export default DashboardView;
