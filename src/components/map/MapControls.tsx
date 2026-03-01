'use client';
import { useState } from 'react';
import type { Tag } from '@/types';

interface MapControlsProps {
  tags: Tag[];
  onDateChange: (from: string, to: string) => void;
  onTagsChange: (keys: string[]) => void;
}

export function MapControls({ tags, onDateChange, onTagsChange }: MapControlsProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const toggleTag = (key: string) => {
    const updated = selectedTags.includes(key)
      ? selectedTags.filter(k => k !== key)
      : [...selectedTags, key];
    setSelectedTags(updated);
    onTagsChange(updated);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedTags([]);
    onDateChange('', '');
    onTagsChange([]);
  };

  const hasFilters = dateFrom || dateTo || selectedTags.length > 0;

  return (
    <div className="bg-slate-900 border-b border-slate-700/60">
      <div className="flex flex-wrap gap-2 items-center px-3 py-2">
        <input
          type="date"
          value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); onDateChange(e.target.value, dateTo); }}
          className="border border-slate-600 rounded-lg px-2 py-1 text-sm bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [color-scheme:dark]"
        />
        <span className="text-slate-500 text-sm">→</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => { setDateTo(e.target.value); onDateChange(dateFrom, e.target.value); }}
          className="border border-slate-600 rounded-lg px-2 py-1 text-sm bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [color-scheme:dark]"
        />
        <button
          onClick={() => setExpanded(v => !v)}
          className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
            selectedTags.length > 0
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
          }`}
        >
          🏷 Categorías {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {expanded && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {tags.map(tag => (
            <button
              key={tag.key}
              onClick={() => toggleTag(tag.key)}
              className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                selectedTags.includes(tag.key)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-indigo-500'
              }`}
            >
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
