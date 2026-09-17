import React from 'react';

export function TrackSkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-11 h-11 rounded-lg bg-zinc-800 shrink-0" />
        <div className="space-y-1.5 flex-1 max-w-sm">
          <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
          <div className="h-2.5 bg-zinc-800/70 rounded w-1/2" />
        </div>
      </div>
      <div className="w-12 h-3 bg-zinc-800 rounded" />
    </div>
  );
}

export function TrackSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#121216] border border-zinc-800/40 rounded-2xl p-3.5 animate-pulse">
          <div className="aspect-square rounded-xl bg-zinc-800 mb-3" />
          <div className="h-3.5 bg-zinc-800 rounded w-3/4 mb-2" />
          <div className="h-2.5 bg-zinc-800/70 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
