
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
        <h2 className="text-6xl font-black italic tracking-tighter text-white">INITIALIZE RELAY</h2>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-2">CONFIGURE ASSET PARAMETERS AND PAYLOAD</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="premium-panel p-10 space-y-10">
            <h3 className="text-xs font-black tracking-[0.5em] text-[#00D1FF] uppercase border-b border-white/5 pb-4">01 // Public Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputGroup label="Display Name" value={label} onChange={(val: string) => setLabel(val.toUpperCase())} placeholder="e.g. INVOICE_01" />
              <InputGroup label="Network Icon URL" value={icon} onChange={(val: string) => setIcon(val)} placeholder="https://..." type="url" />
              <InputGroup label="SOL Value" value={amount} onChange={(val: string) => setAmount(Number(val))} type="number" step="0.001" />
            </div>
          </section>

          <section className="premium-panel p-10 space-y-10 border-l-2 border-l-purple-500/50">
            <h3 className="text-xs font-black tracking-[0.5em] text-purple-400 uppercase border-b border-white/5 pb-4">02 // Encrypted Payload</h3>
            <div className="space-y-8">
              <InputGroup label="Private Title" value={title} onChange={(val: string) => setTitle(val)} placeholder="Visible only to you after payment" />
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Line Items</label>
                  <button type="button" onClick={addLineItem} className="text-[10px] font-black text-[#00D1FF] hover:underline uppercase">Add Item</button>
                </div>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-[3]">
                      <input 
                        type="text" 
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white font-bold text-xs outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        step="0.001"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateLineItem(idx, 'amount', Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-[#00D1FF] font-bold text-xs outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-32 bg-white/5 border border-white/10 px-5 py-4 rounded-xl text-white font-bold text-xs outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="premium-panel p-10 space-y-8 sticky top-32">
            <h3 className="text-xs font-black tracking-[0.5em] text-slate-500 uppercase border-b border-white/5 pb-4">Finalization</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
                <span className="text-[10px] font-bold text-[#00D1FF] italic">SOLANA_PAY_V1</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security</span>
                <span className="text-[10px] font-bold text-purple-400 italic">AES-256-GCM</span>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-[#00D1FF] text-black rounded-2xl font-black italic text-xl hover:scale-[1.02] transition-all shadow-[0_15px_40px_rgba(0,209,255,0.2)] flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-cloud-arrow-up"></i> DEPLOY RELAY</>}
            </button>
            <p className="text-[9px] text-slate-600 font-bold uppercase text-center leading-relaxed">Executing this command will commit the public metadata to the local index and encrypt the payload using your master key.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

// Fixed: Added missing InputGroup helper component
const InputGroup = ({ label, value, onChange, placeholder, type = 'text', step }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input 
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-xl text-white font-bold text-sm outline-none focus:border-[#00D1FF]/50 transition-all"
    />
  </div>
);

// Fixed: Added default export
export default CreateRequestView;
