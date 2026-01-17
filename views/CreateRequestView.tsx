
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { encrypt } from '../services/crypto';
import { MockBackend } from '../services/mockBackend';
import { MOCK_TOKENS } from '../constants';
import { PrivateInvoiceData, UserProfile } from '../types';

interface CreateRequestViewProps {
  profile: UserProfile | null;
}

const CreateRequestView: React.FC<CreateRequestViewProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Public
  const [label, setLabel] = useState('Payment for Consulting');
  const [icon, setIcon] = useState('https://picsum.photos/id/1/200');
  const [amount, setAmount] = useState<number>(1.5);
  const [token, setToken] = useState(MOCK_TOKENS[0].mint);
  
  // Private
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<{description: string, amount: number}[]>([{ description: '', amount: 0 }]);

  if (!profile) return <Navigate to="/" />;

  const addLineItem = () => setLineItems([...lineItems, { description: '', amount: 0 }]);
  const updateLineItem = (idx: number, field: string, val: any) => {
    const updated = [...lineItems];
    (updated[idx] as any)[field] = val;
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const privateData: PrivateInvoiceData = {
        title: title || label,
        items: lineItems.filter(item => item.description),
        notes,
      };
      const ciphertext = await encrypt(privateData);
      const req = await MockBackend.createRequest({
        label, icon, amount, tokenMint: 'SOL', ciphertext,
      }, profile.pubkey);
      navigate('/requests');
    } catch (err) {
      alert("Error creating request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Create Request</h2>
        <p className="text-slate-500">Configure public payment metadata and private invoice details.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Public Fields */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <i className="fa-solid fa-eye"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Public Fields</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Visible to wallets & block explorers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Display Label</label>
                <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                <p className="text-[10px] text-slate-400">e.g., Company Name or Service Category</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Icon URL</label>
                <input type="url" value={icon} onChange={e => setIcon(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Amount</label>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>
          </section>

          {/* Private Fields */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <i className="fa-solid fa-lock"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Private Fields</h3>
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Encrypted locally & stored as ciphertext</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Internal Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Website Design - Phase 1" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 block">Line Items</label>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <input type="text" placeholder="Description" value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-slate-100 outline-none" />
                    <input type="number" placeholder="Amt" value={item.amount} onChange={e => updateLineItem(idx, 'amount', Number(e.target.value))} className="w-24 px-4 py-2 rounded-xl border border-slate-100 outline-none" />
                  </div>
                ))}
                <button type="button" onClick={addLineItem} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">+ Add Line Item</button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Private Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24 outline-none"></textarea>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white sticky top-24 shadow-2xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Payment Preview</h4>
            <div className="bg-white rounded-2xl p-6 text-slate-900 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <img src={icon} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt="" />
                <h5 className="font-bold text-lg text-center">{label}</h5>
              </div>
              <div className="py-4 border-y border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Total</span>
                  <span className="font-black text-xl text-indigo-600">{amount} SOL</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Wallet Support</span>
                  <span className="font-bold flex items-center gap-1"><i className="fa-solid fa-ghost"></i> Phantom</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Creator</span>
                  <span className="font-mono text-[9px] text-slate-400">{profile.pubkey.slice(0, 10)}...</span>
                </div>
              </div>
              <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-qrcode"></i> Generate Link</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateRequestView;
