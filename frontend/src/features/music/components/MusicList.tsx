"use client";

import { Music } from "@/types/domain";
import { MusicItem } from "@/features/music/components/MusicItem";
import { Loading } from "@/components/ui/Loading";

export interface MusicListProps {
  music: Music[];
  isLoading: boolean;
  shouldShowDelete: (music: Music) => boolean;
  emptyState: () => React.JSX.Element;
}
export function MusicList({
  music,
  isLoading,
  shouldShowDelete,
  emptyState,
}: {
  music: Music[];
  isLoading: boolean;
  shouldShowDelete: (track: Music) => boolean;
  emptyState: () => React.ReactNode;
}) {
  const onPlay = () => console.log("play");
  const onRemove = () => console.log("remove");

  if (isLoading) {
    return (
      <div className="p-2 text-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
      <div className="space-y-2 p-4">
        {music.length > 0
          ? music.map((track) => (
              <div key={track.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <MusicItem
                    music={track}
                    onPlay={onPlay}
                    onRemove={onRemove}
                    showRemoveButton={shouldShowDelete(track)}
                  />
                </div>
              </div>
            ))
          : emptyState()}
      </div>
    </div>
  );
}
