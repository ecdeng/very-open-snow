'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  resortId: string;
}

const STORAGE_KEY = 'snow-app-favorites';

export default function FavoriteButton({ resortId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const favorites: string[] = JSON.parse(stored);
      setIsFavorite(favorites.includes(resortId));
    }
  }, [resortId]);

  const toggleFavorite = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const favorites: string[] = stored ? JSON.parse(stored) : [];

    let updated: string[];
    if (favorites.includes(resortId)) {
      updated = favorites.filter((id) => id !== resortId);
      setIsFavorite(false);
    } else {
      updated = [...favorites, resortId];
      setIsFavorite(true);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${
        isFavorite
          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
      />
      {isFavorite ? 'Saved' : 'Save'}
    </button>
  );
}
