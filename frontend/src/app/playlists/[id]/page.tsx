"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { playlists, music } from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";
import ConfirmModal from "@/components/common/ConfirmModal";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import MusicSearch from "@/components/ui/MusicSearch";
import Button from "@/components/ui/Button";
import { use } from "react";
import { SongItem } from "@/components/features/music/SongItem";
import { Music, Playlist } from "@/types/domain";
import { usePlayer } from "@/store/PlayerContext";
import { Loading } from "@/components/ui/Loading";

type ParamsType = { id: string } | Promise<{ id: string }>;

function isPromise<T>(value: unknown): value is Promise<T> {
  return typeof value === "object" && value !== null && "then" in value;
}

export default function PlaylistPage({ params }: { params: ParamsType }) {
  const { id } = isPromise<{ id: string }>(params) ? use(params) : params;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setLoading] = useState(true);
  const { playTrack } = usePlayer();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [songToRemove, setSongToRemove] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<number | "">("");
  const [adding, setAdding] = useState(false);
  const [selectedSongTitle, setSelectedSongTitle] = useState("");

  useEffect(() => {
    if (!id) return;
    loadPlaylist();
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
      const data = await playlists.getById(Number(id));
      setPlaylist(data);
    } catch (error) {
      console.error("Failed to load playlist:", error);
    } finally {
      setLoading(false);
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
      const songToRemoveObj = playlist.songs?.find(
        (s) => s.id === songToRemove
      );
      setPlaylist({
        ...playlist,
        songs: playlist.songs?.filter((s) => s.id !== songToRemove),
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

  const createTrackObject = useCallback(
    (track: Music) => ({
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      duration: track.duration,
      url: music.stream(track.id),
    }),
    []
  );

  const handlePlayTrack = useCallback(
    (track: Music) => {
      playTrack(createTrackObject(track));
    },
    [playTrack, createTrackObject]
  );

  return (
    <LayoutContent>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <Loading className="h-64" />
        ) : !playlist ? (
          <div className="max-w-lg mx-auto mt-24 bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Playlist Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
              Sorry, we couldn&apos;t find the playlist you were looking for. It
              may have been deleted or the link is incorrect.
            </p>
            <Link
              href="/playlists"
              className="w-full max-w-xs inline-flex justify-center items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50"
            >
              Back to Playlists
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">{playlist.name}</h1>
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

            {playlist.is_owner && (
              <div className="flex justify-between items-end mb-6 gap-4 w-full">
                <form onSubmit={handleAddSong}>
                  <div className="flex items-end gap-2">
                    <div>
                      <MusicSearch
                        value={selectedSongTitle}
                        onChange={setSelectedSongTitle}
                        onMusicSelect={(song) => setSelectedSongId(song.id)}
                        excludeIds={(playlist.songs ?? []).map((s) => s.id)}
                      />
                    </div>
                    <div>
                      <Button
                        type="submit"
                        disabled={!selectedSongId || adding}
                        isLoading={adding}
                      >
                        {adding ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
              <div className="space-y-2 p-4">
                {playlist.songs && playlist.songs.length > 0 ? (
                  playlist.songs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <SongItem
                          song={{
                            id: song.id,
                            title: song.title,
                            artist: song.artist,
                            duration: song.duration,
                            url: music.stream(song.id),
                          }}
                          onPlay={() => handlePlayTrack(song)}
                          onRemove={() => handleRemoveSong(song.id)}
                          showRemoveButton={playlist.is_owner}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No songs in this playlist yet
                  </div>
                )}
              </div>
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
        )}
      </div>
    </LayoutContent>
  );
}
