
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { MockBackend } from '../services/mockBackend';
import { SolanaPayRequest, RequestStatus, UserProfile } from '../types';

interface RequestsViewProps {
  searchQuery: string;
  profile: UserProfile | null;
}

const RequestsView: React.FC<RequestsViewProps> = ({ searchQuery, profile }) => {
  const [requests, setRequests] = useState<SolanaPayRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (profile) {
        const r = await MockBackend.getAllRequests(profile.pubkey);
        setRequests(r);
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  if (!profile) return <Navigate to="/" />;

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch = r.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.amount.toString().includes(searchQuery) ||
                          r.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const copyPayLink = (id: string) => {
    const url = `${window.location.origin}/#/pay/${id}`;
    navigator.clipboard.writeText(url);
    alert("Payment link copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Requests</h2>
          <p className="text-slate-500">Manage your active and completed payment requests.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {(['ALL', ...Object.values(RequestStatus)] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === s ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Label</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Expires</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{req.label}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{req.amount} {req.tokenMint}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(req.expiresAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => copyPayLink(req.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Copy Link"
                    >
                      <i className="fa-solid fa-link"></i>
                    </button>
                    <Link 
                      to={`/pay/${req.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all inline-block"
                      title="View Page"
                    >
                      <i className="fa-solid fa-up-right-from-square"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300 text-2xl">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
              <p className="text-slate-400 font-medium">No requests found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{status: RequestStatus}> = ({ status }) => {
  const styles = {
    [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
    [RequestStatus.PAID]: 'bg-green-100 text-green-700',
    [RequestStatus.EXPIRED]: 'bg-slate-100 text-slate-700',
    [RequestStatus.CANCELLED]: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

export default RequestsView;
