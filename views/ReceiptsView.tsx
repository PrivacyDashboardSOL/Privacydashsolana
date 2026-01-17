
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
    if (data) {
      setDecryptedData(prev => ({ ...prev, [req.id]: data }));
    }
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
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="animate-spin text-4xl text-[#00D1FF]"><i className="fa-solid fa-circle-notch"></i></div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-700">
      <div className="mb-12 border-b border-white/5 pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase">Receipt_Storage</h2>
          <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Decentralized proof of payment history</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white italic">{receipts.length}</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirmed Entries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {receipts.map(req => (
          <div key={req.id} className="premium-panel light-sweep flex flex-col group overflow-hidden border-l-2 border-l-[#00D1FF]/30">
            <div className="p-8 space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-2 group-hover:border-[#00D1FF]/50 transition-colors">
                  <img src={req.icon} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white italic tracking-tighter">{req.amount} <span className="text-xs text-[#00D1FF]">SOL</span></p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString().toUpperCase()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-black italic text-xl text-white group-hover:text-[#00D1FF] transition-colors">{req.label.toUpperCase()}</h4>
                <p className="text-[10px] text-slate-500 font-bold font-mono mt-2 break-all opacity-40">SIG: {req.signature?.slice(0, 32)}...</p>
              </div>

              {decryptedData[req.id] ? (
                <div className="bg-[#00D1FF]/5 border border-[#00D1FF]/20 rounded-2xl p-6 animate-in zoom-in-95 duration-500 space-y-4">
                  <h5 className="text-[10px] font-black text-[#00D1FF] uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-unlock text-[8px]"></i> Decrypted Payload
                  </h5>
                  <p className="text-sm font-black text-white italic">{decryptedData[req.id].title}</p>
                  <div className="space-y-1">
                    {decryptedData[req.id].items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400">{item.description}</span>
                        <span className="text-white">{item.amount} SOL</span>
                      </div>
                    ))}
                  </div>
                  {decryptedData[req.id].notes && (
                    <p className="text-[10px] text-slate-500 italic pt-2 border-t border-white/5">{decryptedData[req.id].notes}</p>
                  )}
                </div>
              ) : (
                <div className="bg-white/2 rounded-2xl p-6 text-center border border-dashed border-white/10 group-hover:border-white/20 transition-colors">
                  <i className="fa-solid fa-lock text-slate-700 mb-2"></i>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Data Isolated & Encrypted</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-black/20 border-t border-white/5 flex gap-4">
              {!decryptedData[req.id] ? (
                <button 
                  onClick={() => handleDecrypt(req)}
                  className="flex-1 py-4 bg-[#00D1FF] text-black rounded-xl text-[10px] font-black italic hover:scale-105 transition-all shadow-[0_5px_15px_rgba(0,209,255,0.2)] uppercase tracking-widest"
                >
                  Unlock Record
                </button>
              ) : (
                <button 
                  onClick={() => exportReceipt(req)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black italic hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Export Data Stream
                </button>
              )}
            </div>
          </div>
        ))}
        {receipts.length === 0 && (
          <div className="col-span-full py-32 premium-panel border-dashed border-white/5 text-center flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-white/2 rounded-full flex items-center justify-center text-4xl text-slate-800">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <p className="text-slate-600 font-black italic uppercase tracking-[0.5em] text-sm">Vault Empty - No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsView;
