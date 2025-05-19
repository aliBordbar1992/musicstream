"use client";

import React, { useState, useEffect } from "react";
import { FileUploadForm } from "@/components/features/music/FileUploadForm";
import { LinkUploadForm } from "@/components/features/music/LinkUploadForm";
import { MusicList } from "@/components/features/music/MusicList";
import { music } from "@/lib/api";
import { Music } from "@/types/domain";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { LayoutContent } from "@/components/layouts/LayoutContent";

export default function MusicPage() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMusic = async () => {
    try {
      const data = await music.getAll();
      setMusicList(data);
    } catch (error) {
      console.error("Failed to fetch music:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic();
  }, []);

  const handleUploadSuccess = () => {
    fetchMusic();
  };

  return (
    <LayoutContent>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-8">Music Library</h1>
        </div>

        <Tabs defaultValue="file" className="mb-8">
          <TabsList>
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="link">Direct Link</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <FileUploadForm onSuccess={handleUploadSuccess} />
          </TabsContent>
          <TabsContent value="link">
            <LinkUploadForm onSuccess={handleUploadSuccess} />
          </TabsContent>
        </Tabs>

        <MusicList
          music={musicList}
          loading={loading}
          onDelete={handleUploadSuccess}
        />
      </div>
    </LayoutContent>
  );
}
