import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, ListMusic, History, Settings, LogOut, Disc } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/library', label: 'Library', icon: Library },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/playlists', label: 'Playlists', icon: ListMusic },
    { to: '/history', label: 'Recently Played', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#121216] border-r border-zinc-800/60 p-4 select-none shrink-0 h-screen sticky top-0">
      {/* Melo Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <Disc className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-outfit">Melo</h1>
          <p className="text-[10px] text-purple-400 font-medium tracking-widest uppercase">Your Music</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="pt-4 border-t border-zinc-800/60 mt-auto">
        <div className="flex items-center justify-between px-2">
          <div className="truncate">
            <p className="text-xs text-zinc-400">Signed in as</p>
            <p className="text-sm font-semibold text-zinc-200 truncate">{user?.username || 'Private Master'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
