"use client";

import { useEffect, useState, useRef } from "react";
import { playlists, music } from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { formatDuration } from "@/utils/formatDuration";

interface Playlist {
  id: number;
  name: string;
  is_owner: boolean;
  created_at: string;
  songs: Song[];
}

interface Song {
  id: number;
  title: string;
  artist: string | { id: number; name: string };
  duration: number;
}

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [songToRemove, setSongToRemove] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<number | "">("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadPlaylist();
    loadAllSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Initialize audio element on client side
    audioRef.current = new Audio();

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const loadPlaylist = async () => {
    if (!id) return;
    try {
      const data = await playlists.getById(parseInt(id));
      setPlaylist(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to load playlist");
      } else {
        toast.error("Failed to load playlist");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllSongs = async () => {
    try {
      const data = await music.getAll();
      setAllSongs(data);
    } catch {
      // ignore for now
    }
  };

  const playTrack = (track: Song) => {
    if (!audioRef.current) return;

    if (currentTrack?.id === track.id) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
        toast.success(`Playing ${track.title}`);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
        toast.success(`Paused ${track.title}`);
      }
    } else {
      audioRef.current.src = music.stream(track.id);
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentTrack(track);
      toast.success(`Now playing ${track.title}`);
    }
  };

  const handleRemoveSong = (songId: number) => {
    setSongToRemove(songId);
    setShowConfirmModal(true);
  };

  const confirmRemoveSong = async () => {
    if (!playlist || !songToRemove) return;

    try {
      await playlists.removeSong(playlist.id, songToRemove);
      const songToRemoveObj = playlist.songs.find((s) => s.id === songToRemove);
      setPlaylist({
        ...playlist,
        songs: playlist.songs.filter((s) => s.id !== songToRemove),
      });
      toast.success(`Removed "${songToRemoveObj?.title}" from playlist`);
    } catch (error: unknown) {
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

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlist || !selectedSongId) return;
    setAdding(true);
    try {
      await playlists.addSong(playlist.id, selectedSongId);
      toast.success("Song added to playlist");
      // Refetch playlist
      await loadPlaylist();
      setSelectedSongId("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add song");
      } else {
        toast.error("Failed to add song");
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Playlist not found</h1>
        <Link
          href="/playlists"
          className="text-indigo-600 hover:text-indigo-500"
        >
          Back to Playlists
        </Link>
      </div>
    );
  }

  return (
    <LayoutContent>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Created {new Date(playlist.created_at).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="/playlists"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-neutral-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-neutral-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            Back to Playlists
          </Link>
        </div>

        {/* Add Song Form */}
        {playlist.is_owner && (
          <form
            onSubmit={handleAddSong}
            className="mb-6 flex items-center gap-2"
          >
            <select
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(Number(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Add a song...</option>
              {allSongs
                .filter(
                  (song) =>
                    !(playlist.songs ?? []).some((s) => s.id === song.id)
                )
                .map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.title} -{" "}
                    {typeof song.artist === "string"
                      ? song.artist
                      : song.artist?.name}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              disabled={!selectedSongId || adding}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
        )}

        <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-neutral-700">
            {playlist.songs && playlist.songs.length > 0 ? (
              playlist.songs.map((song) => (
                <li key={song.id}>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <button
                      onClick={() => playTrack(song)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {song.title}
                        </p>
                        {currentTrack?.id === song.id && (
                          <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                            {isPlaying ? "▶️" : "⏸️"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {typeof song.artist === "string"
                          ? song.artist
                          : song.artist?.name}
                      </p>
                    </button>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                        {formatDuration(song.duration)}
                      </span>
                      {playlist.is_owner && (
                        <button
                          onClick={() => handleRemoveSong(song.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No songs in this playlist yet
              </li>
            )}
          </ul>
        </div>

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmRemoveSong}
          title="Remove Song"
          message="Are you sure you want to remove this song from the playlist?"
          confirmText="Remove"
        />
      </div>
    </LayoutContent>
  );
}
