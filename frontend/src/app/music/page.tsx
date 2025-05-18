"use client";

import { useState, useRef, useCallback } from "react";
import { music } from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
import { usePlayer } from "@/store/PlayerContext";
import Input from "@/components/ui/Input";
import ArtistSearch from "@/components/ui/ArtistSearch";
import ConfirmModal from "@/components/common/ConfirmModal";
import { SongItem } from "@/components/features/music/SongItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { Trash2 } from "lucide-react";

interface Music {
  id: number;
  title: string;
  artist: Artist;
  duration: number;
  created_at: string;
}

interface Artist {
  id: number;
  name: string;
}

export default function MusicPage() {
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Music | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
  });
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const { playTrack } = usePlayer();
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => music.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => music.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      toast.success("Track deleted successfully");
      setDeleteModalOpen(false);
      setTrackToDelete(null);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to delete track");
      } else {
        toast.error("Failed to delete track");
      }
    },
  });

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleDeleteClick = (track: Music) => {
    setTrackToDelete(track);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (trackToDelete) {
      deleteMutation.mutate(trackToDelete.id);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    console.log("Uploading music");
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.artist.trim()) {
      toast.error("Please enter an artist");
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
      toast.success("Music uploaded successfully");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormData({ title: "", artist: "", album: "" });
      setSelectedArtist(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to upload music");
      } else {
        toast.error("Failed to upload music");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        <h1 className="text-3xl font-bold mb-8">Music Library</h1>
        <form
          onSubmit={handleUpload}
          className="mb-8 space-y-4 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm"
        >
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
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, artist: value }))
              }
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
              <label
                htmlFor="music"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
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
              {uploading ? "Uploading..." : "Upload Music"}
            </button>
          </div>
        </form>
        <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
          <div className="space-y-2 p-4">
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              tracks.map((track: Music) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <SongItem
                      id={track.id}
                      title={track.title}
                      artist={track.artist.name}
                      duration={track.duration}
                      onPlay={() => handlePlayTrack(track)}
                    />
                  </div>
                  <button
                    className="ml-4 p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => handleDeleteClick(track)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setTrackToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Track"
          message="Are you sure you want to delete this track? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </LayoutContent>
  );
}
