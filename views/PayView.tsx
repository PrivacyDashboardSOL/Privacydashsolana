
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
      // 1. Create Real Transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(request.creator),
          lamports: request.amount * LAMPORTS_PER_SOL,
        })
      );

      // 2. Set Reference for Solana Pay tracking
      // In a full implementation, we'd add the reference to the transaction instruction
      
      // 3. Send Transaction through Phantom
      const signature = await sendTransaction(transaction, connection);
      
      // 4. Confirm Transaction on Mainnet
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash
      }, 'confirmed');

      // 5. Mark as paid in our dashboard backend
      await MockBackend.markPaid(request.id, signature, publicKey.toBase58());
      
      setConfirmed(true);
    } catch (err: any) {
      console.error("Payment failed", err);
      setError(err.message || "Transaction rejected or failed.");
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold tracking-tight">Accessing Solana Mainnet...</p>
    </div>
  );
  
  if (!request) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-red-500 font-bold">Request Invalid or Expired</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
          {confirmed ? (
            <div className="p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl">
                <i className="fa-solid fa-check-double"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Complete</h2>
                <p className="text-slate-500 mt-2 font-medium">Transaction has been confirmed on the Solana blockchain.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-mono text-slate-400 text-left break-all border border-slate-100">
                Signature: {request.signature}
              </div>
              <div className="pt-4 space-y-4">
                <button onClick={handleUnlock} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                  <i className="fa-solid fa-unlock"></i> Unlock Invoice Details
                </button>
                <Link to="/" className="block text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Back to Dashboard</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
                <div className="absolute top-4 right-6 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/70 border border-white/10">Mainnet</div>
                <img src={request.icon} className="w-24 h-24 rounded-3xl mx-auto mb-6 border-4 border-white/10 object-cover shadow-2xl relative z-10" alt="" />
                <h3 className="text-2xl font-black relative z-10 tracking-tight">{request.label}</h3>
                <p className="text-slate-400 text-sm mt-1 font-medium">Requested via Solana Pay</p>
              </div>

              <div className="p-10 space-y-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
                  <h2 className="text-6xl font-black text-slate-900 tracking-tighter">{request.amount} <span className="text-xl text-slate-300">SOL</span></h2>
                </div>

                <div className="space-y-4 py-6 border-y border-slate-50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Network</span>
                    <span className="font-bold text-slate-900">Solana Mainnet</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Recipient</span>
                    <span className="font-mono text-[11px] text-slate-400">{request.creator.slice(0, 8)}...{request.creator.slice(-8)}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <i className="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                    <p className="text-xs text-red-600 font-bold leading-relaxed">{error}</p>
                  </div>
                )}

                {connected ? (
                  <button 
                    onClick={handlePay} 
                    disabled={paying} 
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {paying ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <><i className="fa-solid fa-ghost"></i> Pay with Phantom</>}
                  </button>
                ) : (
                  <button 
                    onClick={handleConnect}
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <i className="fa-solid fa-wallet"></i> Connect Wallet
                  </button>
                )}

                <div className="bg-indigo-50 p-5 rounded-3xl flex gap-3 border border-indigo-100/50">
                  <i className="fa-solid fa-shield-check text-indigo-400 mt-0.5 text-lg"></i>
                  <p className="text-[11px] text-indigo-700 leading-relaxed font-semibold">Standard Solana Pay Protocol. The transaction is handled securely by your Phantom wallet.</p>
                </div>
              </div>
            </>
          )}

          {privateData && (
            <div className="p-8 bg-purple-50 border-t border-purple-100 animate-in slide-in-from-bottom-4 duration-500">
               <h4 className="font-black text-purple-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-receipt"></i> Private Invoice
               </h4>
               <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-purple-100">
                 <h5 className="font-bold text-slate-800">{privateData.title}</h5>
                 <div className="space-y-3 border-t border-slate-50 pt-4">
                   {privateData.items.map((it, i) => (
                     <div key={i} className="flex justify-between text-xs font-bold">
                       <span className="text-slate-500">{it.description}</span>
                       <span className="text-slate-900">{it.amount} SOL</span>
                     </div>
                   ))}
                 </div>
                 {privateData.notes && (
                   <div className="text-[10px] text-slate-400 font-medium italic pt-2 border-t border-slate-50">
                     Note: {privateData.notes}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
           <i className="fa-solid fa-lock text-[10px]"></i>
           <p className="text-center text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Privacy Dash Secured</p>
        </div>
      </div>
    </div>
  );
};

export default PayView;
