'use client';
import type { User, UserStats } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

interface StatsHeaderProps {
  user: User;
  stats: UserStats;
  onUserUpdated?: (updated: User) => void;
}

export function StatsHeader({ user, stats, onUserUpdated }: StatsHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [alias, setAlias] = useState(user.alias ?? '');
  const [residence, setResidence] = useState(user.residence ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, alias: alias || null, residence: residence || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUserUpdated?.(updated);
    }
    setSaving(false);
    setEditing(false);
  };

  return (
    <>
      <div
        className="flex items-center gap-4 px-4 py-3 text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
      >
        {user.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={48}
            height={48}
            className="rounded-full border-2 border-white/30 flex-shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg leading-tight truncate">
              {user.alias ?? user.name}
            </h2>
            <button
              onClick={() => setEditing(true)}
              title="Editar perfil"
              className="text-indigo-200 hover:text-white transition text-sm flex-shrink-0"
            >
              ✏️
            </button>
          </div>
          {user.residence && (
            <p className="text-sm text-indigo-200 truncate">📍 {user.residence}</p>
          )}
        </div>
        <div className="ml-auto flex gap-5 text-center flex-shrink-0">
          <div>
            <div className="text-2xl font-bold">{stats.totalPois}</div>
            <div className="text-xs text-indigo-200 mt-0.5">viajes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalLikesReceived}</div>
            <div className="text-xs text-indigo-200 mt-0.5">likes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.avgRating || '—'}</div>
            <div className="text-xs text-indigo-200 mt-0.5">rating</div>
          </div>
        </div>
      </div>

      {/* Edit profile modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditing(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-white text-lg">Editar perfil</h3>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest">Alias (nombre público)</label>
              <input
                autoFocus
                value={alias}
                onChange={e => setAlias(e.target.value)}
                placeholder={user.name}
                className="mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest">Residencia</label>
              <input
                value={residence}
                onChange={e => setResidence(e.target.value)}
                placeholder="Ciudad, País"
                className="mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-xl text-sm hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
