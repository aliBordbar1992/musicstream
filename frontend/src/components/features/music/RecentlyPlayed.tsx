'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SongItem } from './SongItem';

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  played_at: string;
}

export default function RecentlyPlayed() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentlyPlayed();
  }, []);

  const loadRecentlyPlayed = async () => {
    try {
      const response = await axios.get('/recently-played');
      setSongs(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to load recently played songs');
      } else {
        toast.error('Failed to load recently played songs');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No recently played songs
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song) => (
        <SongItem
          key={`${song.id}-${song.played_at}`}
          id={song.id}
          title={song.title}
          artist={song.artist}
          album={song.album}
          duration={song.duration}
          onPlay={() => {
            // TODO: Implement play functionality
            console.log('Play song:', song.id);
          }}
        />
      ))}
    </div>
  );
} 