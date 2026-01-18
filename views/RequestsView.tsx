import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { MockBackend } from '../services/mockBackend';
import { SolanaPayRequest, RequestStatus, UserProfile } from '../types';
import { ICONS } from '../constants';

interface RequestsViewProps {
  searchQuery: string;
  profile: UserProfile | null;
}

const RequestsView: React.FC<RequestsViewProps> = ({ searchQuery, profile }) => {
  const location = useLocation();
  const [requests, setRequests] = useState<SolanaPayRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'ALL' | 'EXPIRING_SOON'>('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadRequests = async () => {
    if (profile) {
      const r = await MockBackend.getAllRequests(profile.pubkey);
      setRequests(r);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check if we arrived with a specific filter state
    if (location.state && (location.state as any).filter) {
      setFilter((location.state as any).filter);
    }
    loadRequests();
  }, [profile, location.state]);

  if (!profile) return <Navigate to="/" />;

  const filteredRequests = requests.filter(r => {
    let matchesFilter = filter === 'ALL' || r.status === filter;
    
    // Custom complex filter for 'Expiring Soon'
    if (filter === 'EXPIRING_SOON') {
      const soon = new Date(Date.now() + 3600000).toISOString();
      matchesFilter = r.status === RequestStatus.PENDING && r.expiresAt < soon;
    }

    const matchesSearch = r.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancel = async (id: string) => {
    if (confirm("Terminate this relay request? This cannot be undone.")) {
      await MockBackend.cancelRequest(id);
      loadRequests();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div>
            <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Archives</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2 italic">Records terminal // Transmission logs</p>
        </div>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
          {(['ALL', ...Object.values(RequestStatus), 'EXPIRING_SOON'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${
                filter === s ? 'bg-[#00D1FF] text-black shadow-[0_0_15px_rgba(0,209,255,0.3)]' : 'text-slate-500 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredRequests.map(req => (
          <div key={req.id} className="premium-panel light-sweep p-6 flex flex-col md:flex-row items-center justify-between group relative overflow-hidden gap-6 border-white/5 hover:border-[#00D1FF]/20 transition-all">
             <div className="absolute top-0 left-0 w-1 h-full bg-[#00D1FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             <div className="flex items-center gap-6 w-full md:w-auto">
                <StatusIcon status={req.status} />
                <div className="flex items-center gap-5 border-l border-white/5 pl-6">
                    <div className="w-14 h-14 rounded-xl bg-black overflow-hidden border border-white/10 group-hover:border-[#00D1FF]/40 transition-all flex-shrink-0">
                        <img src={req.icon} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black italic text-white group-hover:text-[#00D1FF] transition-all tracking-tight">{req.label.toUpperCase()}</h4>
                        <p className="text-[9px] font-bold text-slate-500 tracking-widest mt-0.5 uppercase">ID: {req.id.toUpperCase()} • {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
             </div>

             <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto">
                <div className="text-right">
                    <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{req.amount} <span className="text-[10px] text-[#00D1FF] uppercase not-italic">SOL</span></p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Asset Weight</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopyLink(req.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/2 border border-white/5 text-slate-500 hover:text-[#00D1FF] transition-all"
                    title="Copy Link"
                  >
                    {copiedId === req.id ? <i className="fa-solid fa-check text-[#00D1FF]"></i> : ICONS.Copy}
                  </button>

                  <Link 
                      to={`/pay/${req.id}`}
                      className="px-6 py-2.5 bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded-xl text-[10px] font-black text-[#00D1FF] hover:bg-[#00D1FF] hover:text-black transition-all uppercase tracking-widest italic flex items-center gap-2"
                  >
                      <i className="fa-solid fa-eye text-[12px]"></i> Inspect
                  </Link>

                  {req.status === RequestStatus.PENDING && (
                    <button 
                      onClick={() => handleCancel(req.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 border border-red-500/10 text-slate-600 hover:text-red-500 hover:border-red-500/40 transition-all"
                      title="Deactivate"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
             </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="p-32 text-center space-y-4 bg-white/2 rounded-3xl border border-dashed border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-2xl text-slate-700">
                <i className="fa-solid fa-satellite-dish"></i>
            </div>
            <p className="text-slate-500 font-black italic uppercase tracking-[0.4em] text-[10px]">No transmission signatures detected on this frequency</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusIcon: React.FC<{status: RequestStatus}> = ({ status }) => {
    const icons = {
        [RequestStatus.PENDING]: { icon: 'fa-hourglass', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        [RequestStatus.PAID]: { icon: 'fa-shield-check', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
        [RequestStatus.EXPIRED]: { icon: 'fa-clock-rotate-left', color: 'text-slate-600 bg-black border-white/5' },
        [RequestStatus.CANCELLED]: { icon: 'fa-ban', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    };
    const { icon, color } = icons[status];
    return (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border ${color}`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
    );
};

export default RequestsView;