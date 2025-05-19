"use client";

import { useEffect } from "react";
import { SongItem } from "./SongItem";
import { music } from "@/lib/api";
import { useDataFetching } from "@/hooks/useDataFetching";
import { Song } from "@/types/domain";

export default function RecentlyPlayed() {
  const { data: songs, loading, error, fetchData } = useDataFetching<Song[]>();

  useEffect(() => {
    fetchData(
      () => music.getRecentlyPlayed(),
      "Failed to load recently played songs"
    );
  }, [fetchData]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="text-sm text-gray-500">No recently played songs</div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song) => (
        <SongItem
          key={`${song.id}-${song.played_at}`}
          song={song}
          onPlay={(song) => {
            // TODO: Implement play functionality
            console.log("Play song:", song.id);
          }}
        />
      ))}
    </div>
  );
}
