
import React, { useState, useEffect } from 'react';
import { MockBackend } from '../services/mockBackend';
import { Stats, SolanaPayRequest, RequestStatus, UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardViewProps {
  profile: UserProfile;
}

const DashboardView: React.FC<DashboardViewProps> = ({ profile }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<SolanaPayRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, r] = await Promise.all([
        MockBackend.getStats(profile.pubkey),
        MockBackend.getAllRequests(profile.pubkey)
      ]);
      setStats(s);
      setRecent(r.slice(0, 5));
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading || !stats) return <div className="p-10 text-center animate-pulse">Loading Dashboard...</div>;

  const chartData = [
    { name: 'Mon', val: 0.5 }, { name: 'Tue', val: 1.2 }, { name: 'Wed', val: 0.8 },
    { name: 'Thu', val: 2.1 }, { name: 'Fri', val: 0.3 }, { name: 'Sat', val: 1.5 },
    { name: 'Sun', val: stats.totalCollected }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem label="Total Collected" val={`${stats.totalCollected.toFixed(2)} SOL`} icon="fa-wallet" color="text-indigo-600" />
        <StatItem label="Pending Requests" val={stats.pendingRequests} icon="fa-clock" color="text-yellow-600" />
        <StatItem label="Paid Today" val={stats.paidToday} icon="fa-check-circle" color="text-green-600" />
        <StatItem label="Expiring Soon" val={stats.expiringSoon} icon="fa-bolt" color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-chart-simple text-indigo-600"></i> Payment Activity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <Link to="/requests" className="text-sm font-bold text-indigo-600">See all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recent.map(req => (
                <div key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={req.icon} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    <div>
                      <h4 className="font-bold text-slate-900">{req.label}</h4>
                      <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{req.amount} SOL</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${req.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status}</span>
                  </div>
                </div>
              ))}
              {recent.length === 0 && <div className="p-10 text-center text-slate-400">No recent activity.</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 overflow-hidden relative">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">Privacy Status</h3>
              <p className="text-indigo-100 text-sm mb-4 leading-relaxed">Invoice details are encrypted locally on this device. Public fields are limited to what Phantom requires for display.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 p-2 rounded-lg">
                  <i className="fa-solid fa-check"></i> Invoice details encrypted
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 p-2 rounded-lg">
                  <i className="fa-solid fa-check"></i> Standard Solana Pay metadata
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4">Quick Links</h4>
            <div className="space-y-3">
              <Link to="/create" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><i className="fa-solid fa-plus text-xs"></i></div>
                <span className="text-sm font-bold text-slate-700">New Request</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, val, icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color} text-xl border border-slate-100`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900">{val}</h3>
    </div>
  </div>
);

export default DashboardView;
