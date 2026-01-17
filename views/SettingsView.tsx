
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { resetMasterKey } from '../services/crypto';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ profile }) => {
  const [autoLock, setAutoLock] = useState(30);

  if (!profile) return <Navigate to="/" />;

  const handleClearCache = () => {
    if (confirm("Warning: Resetting the master key will make all previously created requests/receipts undecipherable unless you have the backup key. Continue?")) {
      resetMasterKey();
      alert("Master key reset. Refreshing...");
      window.location.reload();
    }
  };

  const handleExportBackup = () => {
    const key = localStorage.getItem('privacy_dash_master_key');
    const blob = new Blob([key || ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-dash-key-backup.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Configure your local environment and encryption.</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-user text-lg"></i>
            </div>
            <h3 className="text-lg font-bold">Phantom Profile</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Wallet Public Key</h4>
                <p className="text-xs font-mono text-slate-400 mt-1">{profile.pubkey}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
              <div>
                <h4 className="font-bold text-slate-800">Last Authentication</h4>
                <p className="text-xs text-slate-400 mt-1">{new Date(profile.lastLoginAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-key text-lg"></i>
            </div>
            <h3 className="text-lg font-bold">Encryption & Privacy</h3>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Master Backup</h4>
                <p className="text-sm text-slate-500 max-w-md">Download your local encryption key. You'll need this to access your private data on other devices or after clearing browser cache.</p>
              </div>
              <button 
                onClick={handleExportBackup}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Export Key
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-8">
              <div>
                <h4 className="font-bold text-slate-800">Local Encrypted Cache</h4>
                <p className="text-sm text-slate-500 max-w-md">Wipe your local keys and data. This action is irreversible.</p>
              </div>
              <button 
                onClick={handleClearCache}
                className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                Clear Cache
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-8">
              <div>
                <h4 className="font-bold text-slate-800">Auto-lock Timer</h4>
                <p className="text-sm text-slate-500">Lock decrypted views after inactivity.</p>
              </div>
              <select 
                value={autoLock}
                onChange={(e) => setAutoLock(Number(e.target.value))}
                className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-sm outline-none"
              >
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-ghost text-lg"></i>
            </div>
            <h3 className="text-lg font-bold">Wallet & Protocol</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
              <i className="fa-solid fa-circle-info text-indigo-600 mt-1"></i>
              <div className="text-sm text-indigo-800 font-medium">
                <p className="font-bold">Phantom Only Support</p>
                <p>This application is optimized exclusively for the Phantom wallet on Solana Mainnet. Other wallets are currently unsupported to ensure privacy feature consistency.</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-slate-800">Mainnet Protocol Compliance</h4>
                    <p className="text-sm text-slate-500">Ensures all transaction requests follow strict Mainnet safety guidelines and Phantom standards.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
