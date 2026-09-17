import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import PlayerBar from '../player/PlayerBar';
import NowPlayingModal from '../player/NowPlayingModal';
import { useAuth } from '../../context/AuthContext';
import { Database } from 'lucide-react';

export default function MainLayout() {
  const { dbConnected } = useAuth();

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />

        {/* Database Offline Warning Banner if MongoDB unreachable */}
        {!dbConnected && (
          <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-2 text-xs text-amber-200 flex items-center justify-center gap-2 shrink-0">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Database connection unavailable.</strong> Configure <code className="bg-amber-900/60 px-1 py-0.5 rounded">MONGODB_URI</code> in <code className="bg-amber-900/60 px-1 py-0.5 rounded">.env</code>.
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto pb-28 md:pb-24 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Persistent Floating Bottom Audio Player */}
        <PlayerBar />

        {/* Dedicated Full Screen / Drawer Now Playing View */}
        <NowPlayingModal />

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
