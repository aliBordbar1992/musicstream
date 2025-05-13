'use client';

import { useEffect, useState } from 'react';
import { playlists } from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

interface Playlist {
  id: number;
  name: string;
  is_owner: boolean;
  created_at: string;
}

export default function PlaylistsPage() {
  const [playlistList, setPlaylistList] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await playlists.getAll();
      setPlaylistList(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to load playlists');
      } else {
        toast.error('Failed to load playlists');
      }
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const playlist = await playlists.create(newPlaylistName);
      setPlaylistList([...playlistList, playlist]);
      setNewPlaylistName('');
      toast.success(`Created playlist "${playlist.name}"`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to create playlist');
      } else {
        toast.error('Failed to create playlist');
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    setPlaylistToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!playlistToDelete) return;

    const playlistToRemove = playlistList.find(p => p.id === playlistToDelete);

    try {
      await playlists.delete(playlistToDelete);
      setPlaylistList(playlistList.filter((p) => p.id !== playlistToDelete));
      toast.success(`Deleted playlist "${playlistToRemove?.name}"`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete playlist');
      } else {
        toast.error('Failed to delete playlist');
      }
    } finally {
      setDeleteModalOpen(false);
      setPlaylistToDelete(null);
    }
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
      <h1 className="text-3xl font-bold mb-8">Playlists</h1>

      <form onSubmit={createPlaylist} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Playlist
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-neutral-700">
          {playlistList.map((playlist) => (
            <li key={playlist.id}>
              <div className="px-6 py-4 flex items-center justify-between">
                <Link
                  href={`/playlists/${playlist.id}`}
                  className="flex-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{playlist.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created {new Date(playlist.created_at).toLocaleDateString()}
                  </p>
                </Link>
                {playlist.is_owner && (
                  <button
                    onClick={() => handleDeleteClick(playlist.id)}
                    className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPlaylistToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
} 