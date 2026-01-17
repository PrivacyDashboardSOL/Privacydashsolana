
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MockBackend } from '../services/mockBackend';
import { decrypt } from '../services/crypto';
import { SolanaPayRequest, RequestStatus, PrivateInvoiceData } from '../types';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';

const PayView: React.FC = () => {
  const { id } = useParams();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, select, wallets, connect } = useWallet();
  
  const [request, setRequest] = useState<SolanaPayRequest | null>(null);
  const [privateData, setPrivateData] = useState<PrivateInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      MockBackend.getRequest(id).then(r => {
        if (r) setRequest(r);
        setLoading(false);
      });
    }
  }, [id]);

  const handleConnect = async () => {
    const phantom = wallets.find(w => w.adapter.name === 'Phantom');
    if (phantom) {
      await select(phantom.adapter.name);
      await connect();
    }
  };

  const handlePay = async () => {
    if (!request || !publicKey || !connected) return;
    
    setError(null);
    setPaying(true);
    
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(request.creator),
          lamports: request.amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash
      }, 'confirmed');

      await MockBackend.markPaid(request.id, signature, publicKey.toBase58());
      
      setConfirmed(true);
    } catch (err: any) {
      console.error("Payment failed", err);
      setError(err.message || "Transaction relay rejected.");
    } finally {
      setPaying(false);
    }
  };

  const handleUnlock = async () => {
    if (request) {
      const data = await decrypt(request.ciphertext);
      setPrivateData(data);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-16 h-16 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin accent-glow"></div>
      <p className="text-slate-500 font-black italic uppercase tracking-[0.4em] text-xs">Pinging Solana Relay...</p>
    </div>
  );
  
  if (!request) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <div className="premium-panel p-10 text-center space-y-4 border-red-500/20">
        <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
        <h2 className="text-2xl font-black italic text-white uppercase">Relay Failed</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Request sequence has expired or is invalid.</p>
        <Link to="/" className="block pt-6 text-[#00D1FF] font-black uppercase tracking-widest text-[10px]">Return to Base</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 pb-20">
      <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="premium-panel light-sweep overflow-hidden border-[#00D1FF]/20 shadow-[0_0_60px_rgba(0,209,255,0.05)]">
          {confirmed ? (
            <div className="p-12 text-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto text-4xl border border-green-500/30 accent-glow">
                <i className="fa-solid fa-check-double"></i>
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase">Transfer Complete</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Transmission verified on Mainnet-Beta</p>
              </div>
              
              <div className="bg-black/40 p-5 rounded-2xl text-[10px] font-mono text-slate-500 text-left break-all border border-white/5 space-y-2">
                <p className="text-green-500 font-black uppercase tracking-widest text-[8px]">TX_SIGNATURE</p>
                <p className="leading-relaxed">{request.signature || 'N/A'}</p>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={handleUnlock} 
                  className="w-full py-5 bg-[#00D1FF] text-black rounded-2xl font-black italic text-lg hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,209,255,0.2)] flex items-center justify-center gap-3"
                >
                  <i className="fa-solid fa-unlock"></i> Unlock Secure Info
                </button>
                <Link to="/" className="block text-xs font-black text-slate-600 hover:text-white transition-colors uppercase tracking-widest italic pt-4">Return to Dashboard</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="p-12 text-center relative overflow-hidden bg-white/2 border-b border-white/5">
                <div className="absolute top-6 right-8 px-4 py-1.5 bg-[#00D1FF]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#00D1FF] border border-[#00D1FF]/30">Live_Mainnet</div>
                <div className="w-28 h-28 rounded-3xl mx-auto mb-8 border border-white/10 overflow-hidden shadow-2xl group relative">
                    <img src={request.icon} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <h3 className="text-4xl font-black italic text-white tracking-tighter uppercase">{request.label}</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Solana Pay Protocol Relay</p>
              </div>

              <div className="p-12 space-y-10">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4">Transfer weight</p>
                  <h2 className="text-7xl font-black text-white tracking-tighter italic">{request.amount} <span className="text-2xl text-[#00D1FF]">SOL</span></h2>
                </div>

                <div className="space-y-5 py-8 border-y border-white/5">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
                    <span className="text-slate-600 uppercase">Target Address</span>
                    <span className="font-mono text-slate-400">{request.creator.slice(0, 10)}...{request.creator.slice(-10)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
                    <span className="text-slate-600 uppercase">Relay Path</span>
                    <span className="text-white italic">MAINNET-BETA // PHANTOM</span>
                  </div>
                </div>

                {error && (
                  <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20 flex gap-4 animate-in slide-in-from-top-2">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                    <p className="text-[10px] text-red-400 font-black uppercase leading-relaxed italic">{error}</p>
                  </div>
                )}

                {connected ? (
                  <button 
                    onClick={handlePay} 
                    disabled={paying} 
                    className="w-full py-6 bg-[#00D1FF] text-black rounded-2xl font-black italic text-xl hover:scale-105 transition-all shadow-[0_15px_40px_rgba(0,209,255,0.2)] flex items-center justify-center gap-4 disabled:opacity-40"
                  >
                    {paying ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-bolt"></i> Initiate Transfer</>}
                  </button>
                ) : (
                  <button 
                    onClick={handleConnect}
                    className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black italic text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-4"
                  >
                    <i className="fa-solid fa-wallet"></i> Handshake Required
                  </button>
                )}

                <div className="bg-white/2 p-6 rounded-2xl flex gap-4 border border-white/5">
                  <i className="fa-solid fa-shield-halved text-[#00D1FF] text-xl opacity-50"></i>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase">Standard Solana Pay Protocol logic is engaged. Transaction signing is isolated within your Phantom session.</p>
                </div>
              </div>
            </>
          )}

          {privateData && (
            <div className="p-10 bg-purple-500/5 border-t border-purple-500/20 animate-in slide-in-from-bottom-6 duration-700">
               <h4 className="font-black text-purple-400 text-[10px] uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
                 <i className="fa-solid fa-file-invoice"></i> Private Module Data
               </h4>
               <div className="premium-panel p-8 space-y-6 bg-black/40 border-purple-500/10">
                 <h5 className="font-black italic text-xl text-white tracking-tight">{privateData.title.toUpperCase()}</h5>
                 <div className="space-y-4 border-t border-white/5 pt-6">
                   {privateData.items.map((it, i) => (
                     <div key={i} className="flex justify-between text-xs font-black italic">
                       <span className="text-slate-500 uppercase">{it.description}</span>
                       <span className="text-[#00D1FF]">{it.amount} SOL</span>
                     </div>
                   ))}
                 </div>
                 {privateData.notes && (
                   <div className="text-[10px] text-slate-500 font-bold italic pt-4 border-t border-white/5 leading-relaxed">
                     RELAY_NOTES: {privateData.notes}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-4 opacity-10">
           <div className="h-px bg-white w-12"></div>
           <p className="text-[9px] font-black text-white uppercase tracking-[0.6em]">Privacy Dash Secured</p>
           <div className="h-px bg-white w-12"></div>
        </div>
      </div>
    </div>
  );
};

export default PayView;
