"use client";

import { useState, useEffect } from "react";
import { playlists } from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
import { SongItem } from "@/components/features/music/SongItem";
import { Music } from "@/types/domain";
import ConfirmModal from "@/components/common/ConfirmModal";

interface PlaylistSongsProps {
  playlistId: number;
  onUpdate?: () => void;
}

export default function PlaylistSongs({
  playlistId,
  onUpdate,
}: PlaylistSongsProps) {
  const [songs, setSongs] = useState<Music[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [songToRemove, setSongToRemove] = useState<number | null>(null);

  useEffect(() => {
    loadSongs();
  }, [playlistId]);

  const loadSongs = async () => {
    try {
      const data = await playlists.getSongs(playlistId);
      setSongs(data);
    } catch (error) {
      console.error("Failed to load songs:", error);
      toast.error("Failed to load songs");
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
      setSongs(songs.filter((s) => s.id !== songToRemove));
      toast.success("Song removed from playlist");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to remove song");
      } else {
        toast.error("Failed to remove song");
      }
    } finally {
      setShowConfirmModal(false);
      setSongToRemove(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {songs.map((song) => (
          <SongItem
            key={song.id}
            song={song}
            onPlay={() => {
              // TODO: Implement play functionality
              console.log("Play song:", song.id);
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
