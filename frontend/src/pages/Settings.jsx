import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, User, LogOut, Database, Trash2, CheckCircle2, Shield } from 'lucide-react';
import axios from 'axios';

export default function Settings() {
  const { user, logout, dbConnected } = useAuth();
  const { showToast } = useToast();
  const [audioQuality, setAudioQuality] = useState('320kbps');

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all listening history?')) return;
    try {
      await axios.delete('/api/history');
      showToast('Listening history cleared', 'success');
    } catch (e) {
      showToast('Failed to clear history', 'error');
    }
  };

  const handleClearSearchHistory = () => {
    try {
      localStorage.removeItem('melo_recent_searches');
      showToast('Search history cleared', 'success');
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex items-center gap-4 bg-[#121216] border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
          <SettingsIcon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-outfit">Settings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage account, playback preferences, and application data.</p>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-md">
        <h2 className="text-base font-bold text-white font-outfit flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" /> Private Account
        </h2>

        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-200">{user?.username || 'Master User'}</p>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-emerald-400" /> Single-User Master Admin
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Audio Preferences */}
      <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-md">
        <h2 className="text-base font-bold text-white font-outfit">Audio Playback</h2>

        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-200">Streaming Quality</p>
            <p className="text-[11px] text-zinc-500">Prefers highest legitimate stream bitrates</p>
          </div>

          <select
            value={audioQuality}
            onChange={(e) => {
              setAudioQuality(e.target.value);
              showToast(`Audio quality set to ${e.target.value}`, 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="320kbps">High (320kbps)</option>
            <option value="160kbps">Medium (160kbps)</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      {/* Storage & Privacy */}
      <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-md">
        <h2 className="text-base font-bold text-white font-outfit">Storage & System Status</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-200">MongoDB Database Status</p>
                <p className="text-[11px] text-zinc-500">
                  {dbConnected ? 'Connected to database' : 'Database disconnected'}
                </p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
              dbConnected ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50' : 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
            }`}>
              <CheckCircle2 className="w-3 h-3" /> {dbConnected ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Clear Search History</p>
              <p className="text-[11px] text-zinc-500">Removes local search queries</p>
            </div>
            <button
              onClick={handleClearSearchHistory}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Clear Local History
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Clear Listening History</p>
              <p className="text-[11px] text-zinc-500">Deletes saved playback history</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
