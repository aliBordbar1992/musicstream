"use client";

import { FileUploadForm } from "@/components/features/music/FileUploadForm";
import { LinkUploadForm } from "@/components/features/music/LinkUploadForm";
import { MusicList } from "@/components/features/music/MusicList";
import { music } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { useQuery } from "@tanstack/react-query";

export default function MusicPage() {
  const {
    data: musicList,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["music"],
    queryFn: () => music.getAll(),
  });

  const handleUploadSuccess = () => {
    refetch();
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
          loading={isLoading}
          onDelete={handleUploadSuccess}
        />
      </div>
    </LayoutContent>
  );
}
