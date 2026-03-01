'use client';
import type { User, UserStats } from '@/types';
import Image from 'next/image';

interface StatsHeaderProps {
  user: User;
  stats: UserStats;
}

export function StatsHeader({ user, stats }: StatsHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      {user.avatarUrl && (
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={48}
          height={48}
          className="rounded-full border-2 border-white flex-shrink-0"
        />
      )}
      <div className="min-w-0">
        <h2 className="font-bold text-lg leading-tight truncate">
          {user.alias ?? user.name}
        </h2>
        {user.residence && (
          <p className="text-sm opacity-80 truncate">📍 {user.residence}</p>
        )}
      </div>
      <div className="ml-auto flex gap-4 text-center flex-shrink-0">
        <div>
          <div className="text-2xl font-bold">{stats.totalPois}</div>
          <div className="text-xs opacity-75">viajes</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.totalLikesReceived}</div>
          <div className="text-xs opacity-75">likes</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.avgRating || '—'}</div>
          <div className="text-xs opacity-75">rating</div>
        </div>
      </div>
    </div>
  );
}
