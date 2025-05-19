"use client";

import { useState, useEffect } from "react";
import { playlists } from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
import Button from "@/components/ui/Button";

interface Playlist {
  id: number;
  name: string;
  is_owner: boolean;
}

interface AddToPlaylistProps {
  songId: number;
  onSuccess?: () => void;
}

export default function AddToPlaylist({
  songId,
  onSuccess,
}: AddToPlaylistProps) {
  const [playlistList, setPlaylistList] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | "">("");

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await playlists.getAll();
      setPlaylistList((data as Playlist[]).filter((p: Playlist) => p.is_owner));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to load playlists"
        );
      } else {
        toast.error("Failed to load playlists");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylistId) return;

    try {
      await playlists.addSong(selectedPlaylistId, songId);
      toast.success("Song added to playlist");
      setSelectedPlaylistId("");
      onSuccess?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to add song to playlist"
        );
      } else {
        toast.error("Failed to add song to playlist");
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (playlistList.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Create a playlist to add songs
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={selectedPlaylistId}
        onChange={(e) => setSelectedPlaylistId(Number(e.target.value))}
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">Select a playlist</option>
        {playlistList.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name}
          </option>
        ))}
      </select>
      <Button type="submit" isLoading={loading}>
        {loading ? "Adding..." : "Add to Playlist"}
      </Button>
    </form>
  );
}
