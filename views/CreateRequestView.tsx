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
  
  const [label, setLabel] = useState('My Business');
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
      console.error("Failed to create request", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-24 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="mb-12">
        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">New Payment Link</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Get paid directly to your wallet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destination Section - Styled as a Bank Card */}
        <section className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/20 to-purple-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-zinc-900/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-white font-black uppercase text-sm italic">Where You Get Paid</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Funds go directly to this address</p>
              </div>
              <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Vault Active</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 bg-black/60 p-5 rounded-2xl border border-white/5 font-mono text-sm text-white flex items-center justify-between">
                <span className="truncate mr-4">{profile.pubkey}</span>
                <i className="fa-solid fa-shield-check text-[#00D1FF]"></i>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Current Balance</p>
                <p className="text-xl font-black text-white italic">{profile.balance} SOL</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Public Details */}
          <section className="premium-panel p-8 space-y-8 border-t-2 border-t-[#00D1FF]">
            <div>
              <h3 className="text-white font-black uppercase text-sm italic flex items-center gap-2">
                <i className="fa-solid fa-cart-shopping text-[#00D1FF]"></i> 1. Customer Details
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">What the customer sees when paying</p>
            </div>
            
            <div className="space-y-6">
              <InputGroup 
                label="Your Business Name" 
                value={label} 
                onChange={setLabel} 
                placeholder="e.g. My Freelance Studio" 
                help="Appears in the customer's wallet during checkout."
              />
              <InputGroup 
                label="Amount to Charge (SOL)" 
                value={amount} 
                onChange={(val: string) => setAmount(Number(val))} 
                type="number" 
                step="0.001"
                help="The amount the customer will send."
              />
              <InputGroup 
                label="Display Image (URL)" 
                value={icon} 
                onChange={setIcon} 
                placeholder="https://..." 
                type="url"
                help="Optional link to your business logo."
              />
            </div>
          </section>

          {/* Internal Records */}
          <section className="premium-panel p-8 space-y-8 border-t-2 border-t-purple-500">
            <div>
              <h3 className="text-white font-black uppercase text-sm italic flex items-center gap-2">
                <i className="fa-solid fa-lock text-purple-400"></i> 2. Private Records
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Encrypted. Hidden from the blockchain.</p>
            </div>

            <div className="space-y-6">
              <InputGroup 
                label="Internal Project Title" 
                value={title} 
                onChange={setTitle} 
                placeholder="e.g. Logo Design for Client X" 
              />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Line Items</label>
                  <button type="button" onClick={addLineItem} className="text-[10px] font-black text-[#00D1FF] hover:underline uppercase italic">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                        className="flex-[2] bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl text-white font-bold text-xs outline-none focus:border-purple-500/30"
                      />
                      <input 
                        type="number" 
                        placeholder="Price"
                        value={item.amount}
                        onChange={(e) => updateLineItem(idx, 'amount', Number(e.target.value))}
                        className="flex-1 bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl text-purple-400 font-bold text-xs outline-none focus:border-purple-500/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidential Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for your own bookkeeping..."
                  className="w-full h-24 bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-white font-medium text-xs outline-none focus:border-purple-500/30 resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Action Bar */}
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-black/60 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
               <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                  <img src={icon} className="w-full h-full object-cover" alt="" />
               </div>
               <div>
                  <p className="text-xl font-black italic text-white leading-none">{amount} SOL</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{label || 'Unnamed Request'}</p>
               </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-12 py-5 bg-[#00D1FF] text-black rounded-2xl font-black italic text-xl hover:scale-[1.05] transition-all shadow-[0_15px_40px_rgba(0,209,255,0.2)] flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-link"></i> CREATE PAYMENT LINK</>}
          </button>
        </div>
      </form>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, type = 'text', step, help }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-xl text-white font-bold text-sm outline-none focus:border-[#00D1FF]/50 transition-all placeholder:text-slate-700"
    />
    {help && <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wide">{help}</p>}
  </div>
);

export default CreateRequestView;