"use client";

import React, { memo, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSongItem } from "./SortableSongItem";
import { useQueueManagement } from "@/hooks/useQueueManagement";

// Domain types
interface QueueItem {
  id: number;
  type: "next" | "queue";
  position: number;
  music: {
    id: number;
    title: string;
    artist: {
      name: string;
    };
    album?: string;
    duration?: number;
  };
}

// Pure function to sort queue items
const sortQueueItems = (items: QueueItem[]): QueueItem[] => {
  return [...items].sort((a, b) => {
    if (a.type === "next" && b.type !== "next") return -1;
    if (a.type !== "next" && b.type === "next") return 1;
    return a.position - b.position;
  });
};

// Pure component for loading state
const LoadingState = memo(() => (
  <div className="p-4">
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
));

LoadingState.displayName = "LoadingState";

// Pure component for error state
const ErrorState = memo(({ error }: { error: string }) => (
  <div className="p-4 text-red-500">Error: {error}</div>
));

ErrorState.displayName = "ErrorState";

// Pure component for empty state
const EmptyState = memo(({ onCreateQueue }: { onCreateQueue: () => void }) => (
  <div className="p-4 text-center">
    <p className="text-gray-500 mb-4">No queue found</p>
    <button
      onClick={onCreateQueue}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Create Queue
    </button>
  </div>
));

EmptyState.displayName = "EmptyState";

// Pure component for no songs state
const NoSongsState = memo(() => (
  <div className="p-4 text-gray-500 text-center">No songs in queue</div>
));

NoSongsState.displayName = "NoSongsState";

// Pure component for queue items
const QueueItems = memo(
  ({
    items,
    onPlay,
    onRemove,
  }: {
    items: QueueItem[];
    onPlay: (musicId: number) => void;
    onRemove: (id: number) => void;
  }) => (
    <div className="space-y-2">
      {items.map((item) => {
        if (!item.music) {
          console.warn("Queue item has no music:", item);
          return null;
        }

        return (
          <SortableSongItem
            key={item.id}
            id={item.id}
            musicId={item.music.id}
            title={item.music.title}
            artist={item.music.artist.name}
            album={item.music.album}
            duration={item.music.duration}
            onPlay={() => onPlay(item.music.id)}
            onRemove={() => onRemove(item.id)}
          />
        );
      })}
    </div>
  )
);

QueueItems.displayName = "QueueItems";

// Main component
export const QueueList = memo(function QueueList() {
  const [
    { queue, loading, error },
    { createQueue, handleDragEnd, playItem, removeFromQueue },
  ] = useQueueManagement();

  // Memoize sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize sorted items
  const sortedItems = useMemo(
    () => (queue ? sortQueueItems(queue.items) : []),
    [queue]
  );

  // Memoize item IDs for SortableContext
  const itemIds = useMemo(
    () => sortedItems.map((item) => item.id),
    [sortedItems]
  );

  // Memoize handlers
  const handlePlay = useCallback(
    (musicId: number) => {
      playItem(musicId);
    },
    [playItem]
  );

  const handleRemove = useCallback(
    (id: number) => {
      removeFromQueue(id);
    },
    [removeFromQueue]
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!queue) {
    return <EmptyState onCreateQueue={createQueue} />;
  }

  if (queue.items.length === 0) {
    return <NoSongsState />;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{queue.name}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <QueueItems
            items={sortedItems}
            onPlay={handlePlay}
            onRemove={handleRemove}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
});

QueueList.displayName = "QueueList";
