
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MockBackend } from '../services/mockBackend';
import { decrypt } from '../services/crypto';
import { SolanaPayRequest, RequestStatus, PrivateInvoiceData, UserProfile } from '../types';

interface ReceiptsViewProps {
  profile: UserProfile | null;
}

const ReceiptsView: React.FC<ReceiptsViewProps> = ({ profile }) => {
  const [receipts, setReceipts] = useState<SolanaPayRequest[]>([]);
  const [decryptedData, setDecryptedData] = useState<Record<string, PrivateInvoiceData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (profile) {
        const r = await MockBackend.getAllRequests(profile.pubkey);
        setReceipts(r.filter(req => req.status === RequestStatus.PAID));
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  if (!profile) return <Navigate to="/" />;

  const handleDecrypt = async (req: SolanaPayRequest) => {
    if (decryptedData[req.id]) return;
    const data = await decrypt(req.ciphertext);
    setDecryptedData(prev => ({ ...prev, [req.id]: data }));
  };

  const exportReceipt = (req: SolanaPayRequest) => {
    const data = {
      ...req,
      privateData: decryptedData[req.id] || 'ENCRYPTED'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${req.id}.json`;
    a.click();
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading receipts...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Receipts</h2>
        <p className="text-slate-500">Access and decrypt your payment history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receipts.map(req => (
          <div key={req.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-indigo-200 transition-all">
            <div className="p-6 space-y-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 p-2 border border-slate-100">
                  <img src={req.icon} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">{req.amount} {req.tokenMint}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">{req.label}</h4>
                <p className="text-xs text-slate-500 font-mono mt-1 break-all opacity-60">Sig: {req.signature?.slice(0, 20)}...</p>
              </div>

              {decryptedData[req.id] ? (
                <div className="bg-indigo-50 rounded-2xl p-4 animate-in zoom-in-95 duration-300">
                  <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2">Decrypted Info</h5>
                  <p className="text-sm font-semibold text-slate-800">{decryptedData[req.id].title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{decryptedData[req.id].notes}</p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-4 text-center border-2 border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">Details are encrypted</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              {!decryptedData[req.id] ? (
                <button 
                  onClick={() => handleDecrypt(req)}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10"
                >
                  Decrypt Details
                </button>
              ) : (
                <button 
                  onClick={() => exportReceipt(req)}
                  className="flex-1 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all"
                >
                  Export JSON
                </button>
              )}
            </div>
          </div>
        ))}
        {receipts.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
            <i className="fa-solid fa-receipt text-4xl text-slate-200 mb-4 block"></i>
            <p className="text-slate-400 font-medium">No confirmed payments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsView;
