import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Disc, KeyRound, User, Lock, AlertCircle, Database } from 'lucide-react';

export default function Login() {
  const { setupRequired, login, setupMasterAccount, dbConnected } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (setupRequired && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      if (setupRequired) {
        await setupMasterAccount(username.trim(), password);
        showToast('Master account setup completed! Welcome to Melo.', 'success');
      } else {
        await login(username.trim(), password);
        showToast('Welcome back to Melo!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Authentication failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 selection:bg-purple-600 selection:text-white">
      {/* DB Offline Alert */}
      {!dbConnected && (
        <div className="mb-6 max-w-md w-full p-4 rounded-xl bg-amber-950/70 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-3">
          <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300 mb-1">Database connection unavailable</p>
            <p>Please configure <code className="bg-amber-900/60 px-1 py-0.5 rounded">MONGODB_URI</code> in <code className="bg-amber-900/60 px-1 py-0.5 rounded">.env</code> or ensure local MongoDB is running.</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-purple-900/30 mb-3">
            <Disc className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-outfit">Melo</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {setupRequired ? 'First-Run Setup — Create Master Account' : 'Private Single-User Sign In'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                disabled={submitting}
              />
            </div>
          </div>

          {setupRequired && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={submitting}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Processing...</span>
            ) : setupRequired ? (
              <span>Create Master Account</span>
            ) : (
              <span>Sign In to Melo</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
