"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ArtistSearch from "@/components/ui/ArtistSearch";
import { music } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Artist } from "@/types/domain";
import { LinkUploadFormProps } from "@/types/components";

export function LinkUploadForm({ onSuccess }: LinkUploadFormProps) {
  const [downloading, setDownloading] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    artist: "",
    album: "",
  });

  const handleArtistSelect = (artist: Artist) => {
    setFormData((prev) => ({
      ...prev,
      artist: artist.name,
    }));
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      toast.error("Please enter a URL");
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
    setDownloading(true);
    try {
      await music.downloadFromUrl({
        url: formData.url,
        title: formData.title,
        artist: formData.artist,
        album: formData.album || "Unknown Album",
      });
      toast.success("Music downloaded successfully");
      setFormData({ url: "", title: "", artist: "", album: "" });
      onSuccess?.();
    } catch {
      toast.error("Failed to download music");
    } finally {
      setDownloading(false);
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
      onSubmit={handleDownload}
      className="mb-8 space-y-4 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="url"
          name="url"
          label="Music URL"
          value={formData.url}
          onChange={handleInputChange}
          placeholder="Enter direct link to MP3 file"
          required
        />
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
      </div>
      <div className="flex justify-end">
        <Button type="submit" isLoading={downloading}>
          {downloading ? "Downloading..." : "Download"}
        </Button>
      </div>
    </form>
  );
}
