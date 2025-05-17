"use client";

import React from "react";
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

export function QueueList() {
  const [
    { queue, loading, error },
    { createQueue, handleDragEnd, playItem, removeFromQueue },
  ] = useQueueManagement();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!queue) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 mb-4">No queue found</p>
        <button
          onClick={createQueue}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Queue
        </button>
      </div>
    );
  }

  if (queue.items.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">No songs in queue</div>
    );
  }

  // Sort items by type and position
  const sortedItems = [...queue.items].sort((a, b) => {
    if (a.type === "next" && b.type !== "next") return -1;
    if (a.type !== "next" && b.type === "next") return 1;
    return a.position - b.position;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{queue.name}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedItems.map((item) => {
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
                  onPlay={() => playItem(item.music.id)}
                  onRemove={() => removeFromQueue(item.id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
