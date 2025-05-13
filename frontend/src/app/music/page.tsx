'use client';

import { useEffect, useState, useRef } from 'react';
import { music } from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { usePlayer } from '@/context/PlayerContext';
import Input from '@/components/ui/Input';
import ArtistSearch from '@/components/ui/ArtistSearch';

interface Music {
  id: number;
  title: string;
  artist: string;
  duration: number;
  created_at: string;
}

interface Artist {
  id: number;
  name: string;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
  });
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const data = await music.getAll();
      setTracks(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to load music tracks');
      } else {
        toast.error('Failed to load music tracks');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.artist.trim()) {
      toast.error('Please enter an artist');
      return;
    }
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("music", file);
      uploadData.append("title", formData.title);
      uploadData.append("artist", formData.artist);
      uploadData.append("album", formData.album || "Unknown Album");
      if (selectedArtist) {
        uploadData.append("artist_id", selectedArtist.id.toString());
      }
      await music.upload(uploadData);
      toast.success('Music uploaded successfully');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFormData({ title: '', artist: '', album: '' });
      setSelectedArtist(null);
      await loadTracks();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to upload music');
      } else {
        toast.error('Failed to upload music');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Music Library</h1>
      <form onSubmit={handleUpload} className="mb-8 space-y-4 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="title"
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter song title"
            required
          />
          <ArtistSearch
            value={formData.artist}
            onChange={(value) => setFormData(prev => ({ ...prev, artist: value }))}
            onArtistSelect={handleArtistSelect}
            required
          />
          <Input
            id="album"
            name="album"
            label="Album"
            value={formData.album}
            onChange={handleInputChange}
            placeholder="Enter album name (optional)"
          />
          <div>
            <label htmlFor="music" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Music File
            </label>
            <input
              type="file"
              id="music"
              accept="audio/*"
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:text-gray-400"
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Music'}
          </button>
        </div>
      </form>
      <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-neutral-700">
          {tracks.map((track) => (
            <li key={track.id}>
              <button
                onClick={() => playTrack({
                  id: track.id,
                  title: track.title,
                  artist: track.artist,
                  duration: track.duration,
                  url: music.stream(track.id),
                })}
                className="w-full px-6 py-4 flex items-center hover:bg-gray-50 dark:hover:bg-neutral-700"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{track.artist}</p>
                  </div>
                  
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDuration(track.duration)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 