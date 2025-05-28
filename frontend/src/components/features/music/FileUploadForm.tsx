"use client";

import React, { useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ArtistSearch from "@/components/ui/ArtistSearch";
import { music } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Artist } from "@/types/domain";
import { FileUploadFormProps } from "@/types/components";

export function FileUploadForm({ onSuccess }: FileUploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
  });
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleUpload = async (e: React.FormEvent) => {
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
      onSuccess?.();
    } catch {
      toast.error("Failed to upload music");
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

  return (
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
          onChange={(value: string) =>
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
        <Button type="submit" isLoading={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </form>
  );
}
