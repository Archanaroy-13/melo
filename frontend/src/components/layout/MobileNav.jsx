import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, ListMusic } from 'lucide-react';

export default function MobileNav() {
  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/library', label: 'Library', icon: Library },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/playlists', label: 'Playlists', icon: ListMusic }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121216]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 flex justify-around items-center">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-purple-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
