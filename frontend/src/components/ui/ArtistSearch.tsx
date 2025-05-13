import { useState, useEffect, useRef } from 'react';
import { music } from '@/lib/api';
import Input from './Input';

interface Artist {
  id: number;
  name: string;
}

interface ArtistSearchProps {
  value: string;
  onChange: (value: string) => void;
  onArtistSelect?: (artist: Artist) => void;
  error?: string;
  required?: boolean;
}

export default function ArtistSearch({ value, onChange, onArtistSelect, error, required }: ArtistSearchProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadArtists = async () => {
      if (!value) return;
      setLoading(true);
      try {
        const results = await music.searchArtists(value);
        setArtists(results);
      } catch (error) {
        console.error('Failed to load artists:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadArtists, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleArtistSelect = (artist: Artist) => {
    onChange(artist.name);
    onArtistSelect?.(artist);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Input
        id="artist"
        name="artist"
        label="Artist"
        value={value}
        onChange={handleInputChange}
        placeholder="Search for an artist..."
        required={required}
        error={error}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && value && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 shadow-lg rounded-md border border-gray-200 dark:border-neutral-700 max-h-60 overflow-auto">
          {loading ? (
            <div className="p-2 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : artists.length > 0 ? (
            <ul>
              {artists.map((artist) => (
                <li
                  key={artist.id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                  onClick={() => handleArtistSelect(artist)}
                >
                  {artist.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-gray-500 dark:text-gray-400">No artists found</div>
          )}
        </div>
      )}
    </div>
  );
} 