"use client";

import { useEffect } from "react";
import { SongItem } from "./SongItem";
import { music } from "@/lib/api";
import { useDataFetching } from "@/hooks/useDataFetching";
import { Music } from "@/types/domain";
import { Loading } from "@/components/ui/Loading";

export default function RecentlyPlayed() {
  const { data: songs, loading, error, fetchData } = useDataFetching<Music[]>();

  useEffect(() => {
    fetchData(
      () => music.getRecentlyPlayed(),
      "Failed to load recently played songs"
    );
  }, [fetchData]);

  if (loading) {
    return <Loading className="h-64" />;
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
          key={`${song.id}-${song.title}`}
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
