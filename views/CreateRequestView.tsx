
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
  const [icon, setIcon] = useState('https://picsum.photos/id/1/200');
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
    setLoading(true);
    try {
      const privateData: PrivateInvoiceData = {
        title: title || label,
        items: lineItems.filter(item => item.description),
        notes,
      };
      const ciphertext = await encrypt(privateData);
      await MockBackend.createRequest({
        label, icon, amount, tokenMint: 'SOL', ciphertext,
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
        <h2 className="text-6xl font-black italic tracking-tighter text-white">INITIALIZE RELAY</h2>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-2">CONFIGURE ASSET PARAMETERS AND PAYLOAD</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="premium-panel p-10 space-y-10">
            <h3 className="text-xs font-black tracking-[0.5em] text-[#00D1FF] uppercase border-b border-white/5 pb-4">01 // Public Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputGroup label="Display Name" value={label} onChange={val => setLabel(val.toUpperCase())} placeholder="e.g. INVOICE_01" />
              <InputGroup label="Network Icon URL" value={icon} onChange={setIcon} placeholder="https://..." type="url" />
              <InputGroup label="SOL Value" value={amount} onChange={val => setAmount(Number(val))} type="number" step="0.001" />
            </div>
          </section>

          <section className="premium-panel p-10 space-y-10 border-l-2 border-l-purple-500/50">
            <h3 className="text-xs font-black tracking-[0.5em] text-purple-400 uppercase border-b border-white/5 pb-4">02 // Encrypted Storage</h3>
            <div className="space-y-8">
              <InputGroup label="Internal Module Title" value={title} onChange={val => setTitle(val.toUpperCase())} placeholder="SECRET_PROJECT_NAME" />
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Itemized Details</label>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <input type="text" placeholder="RESOURCE DESCRIPTION" value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value.toUpperCase())} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black text-white focus:border-[#00D1FF] outline-none" />
                    <input type="number" placeholder="SOL" value={item.amount} onChange={e => updateLineItem(idx, 'amount', Number(e.target.value))} className="w-32 bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black text-white focus:border-[#00D1FF] outline-none" />
                  </div>
                ))}
                <button type="button" onClick={addLineItem} className="text-[10px] font-black text-[#00D1FF] hover:accent-glow uppercase tracking-widest">+ Append Entry</button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="premium-panel p-10 sticky top-32 border-[#00D1FF]/20 shadow-[0_0_50px_rgba(0,209,255,0.05)]">
            <h3 className="text-xs font-black tracking-[0.5em] text-slate-500 uppercase mb-10">Relay Preview</h3>
            <div className="flex flex-col items-center gap-6 mb-10">
              <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                <img src={icon} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="text-center">
                <h4 className="text-3xl font-black italic text-white tracking-tighter">{label}</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Solana Pay Standard</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-8 mb-10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">Transfer Weight</span>
                <span className="text-2xl font-black italic text-[#00D1FF] accent-glow">{amount} SOL</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-slate-500">PROVIDER</span>
                <span className="text-white">PHANTOM RELAY</span>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-[#00D1FF] text-black font-black italic text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(0,209,255,0.2)]"
            >
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : "FINALIZE & DEPLOY"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, type = "text", step }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input 
      type={type} 
      step={step}
      value={value} 
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic text-sm focus:border-[#00D1FF] outline-none transition-all placeholder:text-slate-700"
    />
  </div>
);

export default CreateRequestView;
