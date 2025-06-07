"use client";

import React from "react";
import { Music } from "@/types/domain";
import { SongItem } from "@/components/features/music/SongItem";
import { Loading } from "@/components/ui/Loading";
import { usePlayer } from "@/store/PlayerContext";
import { music } from "@/lib/api";
import { toast } from "react-hot-toast";
import { MusicListProps } from "@/types/components";

export function MusicList({
  music: musicList,
  loading,
  onDelete,
}: MusicListProps) {
  console.log("musicList", musicList);
  const { playTrack } = usePlayer();

  const handlePlayTrack = (track: Music) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      duration: track.duration,
      url: music.stream(track.id),
      position: 0,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await music.delete(id);
      toast.success("Track deleted successfully");
      onDelete?.();
    } catch {
      toast.error("Failed to delete track");
    }
  };

  if (loading) {
    return <Loading className="h-64" />;
  }

  return (
    <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
      <div className="space-y-2 p-4">
        {musicList.map((track) => (
          <div key={track.id} className="flex items-center justify-between">
            <div className="flex-1">
              <SongItem
                song={{
                  id: track.id,
                  title: track.title,
                  artist: track.artist,
                  duration: track.duration,
                  url: music.stream(track.id),
                }}
                onPlay={() => handlePlayTrack(track)}
                onRemove={() => handleDelete(track.id)}
                showRemoveButton={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
