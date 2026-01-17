
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MockBackend } from '../services/mockBackend';
import { SolanaPayRequest, RequestStatus, UserProfile } from '../types';
import { ICONS } from '../constants';

interface RequestsViewProps {
  searchQuery: string;
  profile: UserProfile | null;
}

const RequestsView: React.FC<RequestsViewProps> = ({ searchQuery, profile }) => {
  const [requests, setRequests] = useState<SolanaPayRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');
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
    loadRequests();
  }, [profile]);

  if (!profile) return <Navigate to="/" />;

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
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
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div>
            <h2 className="text-6xl font-black italic tracking-tighter text-white">RECORDS_TERMINAL</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2">Archives of relay transmissions</p>
        </div>
        
        <div className="flex gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          {(['ALL', ...Object.values(RequestStatus)] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black italic transition-all ${
                filter === s ? 'bg-[#00D1FF] text-black shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'text-slate-500 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.map(req => (
          <div key={req.id} className="premium-panel light-sweep p-8 flex flex-col lg:flex-row items-center justify-between group relative overflow-hidden gap-8">
             <div className="absolute top-0 left-0 w-1 h-full bg-[#00D1FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             <div className="flex items-center gap-8 w-full lg:w-auto">
                <StatusIcon status={req.status} />
                <div className="flex items-center gap-6 border-l border-white/5 pl-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-[#00D1FF]/40 transition-all">
                        <img src={req.icon} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black italic text-white group-hover:text-[#00D1FF] transition-all">{req.label.toUpperCase()}</h4>
                        <p className="text-[10px] font-bold text-slate-500 tracking-widest mt-1">ID: {req.id.toUpperCase()} // ATTACHED: {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
             </div>

             <div className="flex items-center justify-between lg:justify-end gap-12 w-full lg:w-auto">
                <div className="text-right">
                    <p className="text-3xl font-black text-white italic tracking-tighter">{req.amount} <span className="text-xs text-[#00D1FF]">SOL</span></p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Transaction Weight</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleCopyLink(req.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-[#00D1FF] transition-all group"
                    title="Copy Payment Link"
                  >
                    {copiedId === req.id ? <i className="fa-solid fa-check text-[#00D1FF]"></i> : ICONS.Copy}
                  </button>

                  <Link 
                      to={`/pay/${req.id}`}
                      className="px-8 py-3 bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-xl text-[10px] font-black text-[#00D1FF] hover:bg-[#00D1FF] hover:text-black transition-all uppercase tracking-widest italic flex items-center gap-3"
                  >
                      <i className="fa-solid fa-eye"></i> View
                  </Link>

                  {req.status === RequestStatus.PENDING && (
                    <button 
                      onClick={() => handleCancel(req.id)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/5 border border-red-500/10 text-slate-600 hover:text-red-500 hover:border-red-500/40 transition-all"
                      title="Cancel Request"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
                </div>
             </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="p-32 text-center space-y-8 bg-white/2 rounded-3xl border border-dashed border-white/5">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-3xl text-slate-800">
                <i className="fa-solid fa-radar"></i>
            </div>
            <p className="text-slate-600 font-black italic uppercase tracking-[0.4em]">No signatures matching frequency</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusIcon: React.FC<{status: RequestStatus}> = ({ status }) => {
    const icons = {
        [RequestStatus.PENDING]: { icon: 'fa-clock', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        [RequestStatus.PAID]: { icon: 'fa-check-circle', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
        [RequestStatus.EXPIRED]: { icon: 'fa-ban', color: 'text-slate-600 bg-slate-950 border-white/10' },
        [RequestStatus.CANCELLED]: { icon: 'fa-xmark', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    };
    const { icon, color } = icons[status];
    return (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg border ${color}`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
    );
};

export default RequestsView;
