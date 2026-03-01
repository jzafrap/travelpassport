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
    <div className="bg-white border-b shadow-sm">
      {/* Top bar */}
      <div className="flex flex-wrap gap-2 items-center px-3 py-2">
        <input
          type="date"
          value={dateFrom}
          onChange={e => {
            setDateFrom(e.target.value);
            onDateChange(e.target.value, dateTo);
          }}
          className="border rounded px-2 py-1 text-sm"
        />
        <span className="text-gray-400 text-sm">→</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => {
            setDateTo(e.target.value);
            onDateChange(dateFrom, e.target.value);
          }}
          className="border rounded px-2 py-1 text-sm"
        />
        <button
          onClick={() => setExpanded(v => !v)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${
            selectedTags.length > 0
              ? 'bg-blue-500 text-white border-blue-500'
              : 'border-gray-300 hover:border-blue-300'
          }`}
        >
          🏷 Categorías {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-red-500 underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tag panel */}
      {expanded && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
          {tags.map(tag => (
            <button
              key={tag.key}
              onClick={() => toggleTag(tag.key)}
              className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                selectedTags.includes(tag.key)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
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
