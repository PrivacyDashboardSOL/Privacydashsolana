import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { encrypt } from '../services/crypto';
import { MockBackend } from '../services/mockBackend';
import { PrivateInvoiceData, UserProfile } from '../types';

interface CreateRequestViewProps {
  profile: UserProfile | null;
}

const CreateRequestView: React.FC<CreateRequestViewProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [label, setLabel] = useState('SERVICE_ALPHA');
  const [icon, setIcon] = useState('https://i.postimg.cc/QdKmjG6X/Untitled-design-(47).png');
  const [amount, setAmount] = useState<number>(0.05);
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
    if (loading) return;
    setLoading(true);
    try {
      const privateData: PrivateInvoiceData = {
        title: title || label,
        items: lineItems.filter(item => item.description),
        notes,
      };
      const ciphertext = await encrypt(privateData);
      await MockBackend.createRequest({
        label, 
        icon, 
        amount: Number(amount), 
        tokenMint: 'SOL', 
        ciphertext,
      }, profile.pubkey);
      navigate('/requests');
    } catch (err) {
      console.error("Transmission relay failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase">Initialize Relay</h2>
        <p className="text-sm font-black text-slate-300 uppercase tracking-[0.4em] mt-2">Configure asset parameters and payload</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="premium-panel p-10 space-y-10">
            <h3 className="text-xs font-black tracking-[0.5em] text-[#00D1FF] uppercase border-b border-white/5 pb-4">01 // Public Metadata (Wallet Visible)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputGroup label="Merchant Label" value={label} onChange={(val: string) => setLabel(val.toUpperCase())} placeholder="e.g. INVOICE_01" />
              <InputGroup label="Network Icon URL" value={icon} onChange={(val: string) => setIcon(val)} placeholder="https://..." type="url" />
              <InputGroup label="SOL Value" value={amount} onChange={(val: string) => setAmount(Number(val))} type="number" step="0.001" />
            </div>
            <div className="p-5 bg-white/2 rounded-xl border border-dashed border-white/5">
               <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest leading-relaxed">
                 <i className="fa-solid fa-circle-info mr-2 text-[#00D1FF]"></i> 
                 These fields are public and will be displayed in the payer's wallet during transaction signing.
               </p>
            </div>
          </section>

          <section className="premium-panel p-10 space-y-10 border-l-2 border-l-purple-500/50">
            <h3 className="text-xs font-black tracking-[0.5em] text-purple-400 uppercase border-b border-white/5 pb-4">02 // Private Fields (Encrypted)</h3>
            <div className="space-y-8">
              <InputGroup label="Invoice Title" value={title} onChange={(val: string) => setTitle(val)} placeholder="Internal title for your records" />
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Line Items</label>
                  <button type="button" onClick={addLineItem} className="text-[10px] font-black text-[#00D1FF] hover:underline uppercase italic">Add Entry</button>
                </div>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-[3]">
                      <input 
                        type="text" 
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 px-5 py-3 rounded-xl text-white font-bold text-xs outline-none focus:border-[#00D1FF]/30 transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        step="0.001"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateLineItem(idx, 'amount', Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 px-5 py-3 rounded-xl text-[#00D1FF] font-bold text-xs outline-none focus:border-[#00D1FF]/30 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Confidential Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes visible only to you after decryption..."
                  className="w-full h-32 bg-black/40 border border-white/10 px-5 py-4 rounded-xl text-white font-bold text-xs outline-none focus:border-[#00D1FF]/30 transition-all resize-none placeholder:text-slate-600"
                />
              </div>
            </div>
            <div className="p-5 bg-purple-500/5 rounded-xl border border-dashed border-purple-500/20">
               <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest leading-relaxed">
                 <i className="fa-solid fa-lock mr-2"></i> 
                 These fields are encrypted using AES-256-GCM before transmission. They remain locally private.
               </p>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="premium-panel p-10 space-y-8 sticky top-32">
            <h3 className="text-xs font-black tracking-[0.5em] text-slate-300 uppercase border-b border-white/5 pb-4">Execution Panel</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol</span>
                <span className="text-[10px] font-bold text-[#00D1FF] italic">SOLANA_PAY_V1</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Security</span>
                <span className="text-[10px] font-bold text-purple-400 italic">AES-256-GCM</span>
              </div>
            </div>
            
            <div className="pt-4">
               <div className="bg-black/60 rounded-2xl p-6 border border-white/10 mb-8 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 mb-4">
                     <img src={icon} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <p className="text-2xl font-black italic text-white tracking-tighter">{amount} SOL</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{label}</p>
               </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-6 bg-[#00D1FF] text-black rounded-2xl font-black italic text-xl hover:scale-[1.02] transition-all shadow-[0_15px_40px_rgba(0,209,255,0.2)] flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-bolt"></i> DEPLOY REQUEST</>}
                </button>
                <p className="text-[9px] text-slate-200 font-bold uppercase text-center mt-6 leading-relaxed px-4">Committing this command will store the encrypted ciphertext and index the metadata locally.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, type = 'text', step }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</label>
    <input 
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-xl text-white font-bold text-sm outline-none focus:border-[#00D1FF]/50 transition-all placeholder:text-slate-600"
    />
  </div>
);

export default CreateRequestView;