import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Disc, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/40 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Mobile Branding */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md">
          <Disc className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-white font-outfit">Melo</span>
      </div>

      {/* Header Search Trigger */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all text-xs text-left"
        >
          <Search className="w-4 h-4 text-zinc-500" />
          <span>Search songs, artists, or albums...</span>
        </button>
      </div>

      {/* User Badge */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800/80">
          <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/30">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-zinc-300 hidden sm:inline">
            {user?.username || 'Private Master'}
          </span>
        </div>
      </div>
    </header>
  );
}
