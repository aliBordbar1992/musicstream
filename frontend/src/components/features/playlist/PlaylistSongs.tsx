'use client';

import { useState, useEffect } from 'react';
import { playlists } from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import { SongItem } from './SongItem';

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
}

interface PlaylistSongsProps {
  playlistId: number;
  onUpdate?: () => void;
}

export default function PlaylistSongs({ playlistId, onUpdate }: PlaylistSongsProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [songToRemove, setSongToRemove] = useState<number | null>(null);

  useEffect(() => {
    loadSongs();
  }, [playlistId]);

  const loadSongs = async () => {
    try {
      const data = await playlists.getSongs(playlistId);
      setSongs(data as Song[]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to load songs');
      } else {
        toast.error('Failed to load songs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = (songId: number) => {
    setSongToRemove(songId);
    setShowConfirmModal(true);
  };

  const confirmRemoveSong = async () => {
    if (!songToRemove) return;

    try {
      await playlists.removeSong(playlistId, songToRemove);
      toast.success('Song removed from playlist');
      setSongs(songs.filter(song => song.id !== songToRemove));
      onUpdate?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to remove song');
      } else {
        toast.error('Failed to remove song');
      }
    } finally {
      setShowConfirmModal(false);
      setSongToRemove(null);
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
        No songs in this playlist
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {songs.map((song) => (
          <SongItem
            key={song.id}
            id={song.id}
            title={song.title}
            artist={song.artist}
            album={song.album}
            duration={song.duration}
            onPlay={() => {
              // TODO: Implement play functionality
              console.log('Play song:', song.id);
            }}
            onRemove={() => handleRemoveSong(song.id)}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmRemoveSong}
        title="Remove Song"
        message="Are you sure you want to remove this song from the playlist?"
        confirmText="Remove"
      />
    </>
  );
} 