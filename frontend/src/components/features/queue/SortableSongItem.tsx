"use client";

import React, { memo, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { SongItem } from "@/components/features/queue/SongItem";
import { GripVertical, X } from "lucide-react";

// Domain types
export interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
}

export interface SortableSong extends Song {
  musicId: number;
}

// Component props
export interface SortableSongItemProps extends SortableSong {
  onPlay: (song: SortableSong) => void;
  onRemove: (id: number) => void;
  className?: string;
}

// Types for drag handle props
interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}

// Pure component for drag handle
const DragHandle = memo(({ attributes, listeners }: DragHandleProps) => (
  <button
    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
    {...attributes}
    {...listeners}
    aria-label="Drag to reorder"
  >
    <GripVertical className="w-4 h-4 text-gray-400" />
  </button>
));

DragHandle.displayName = "DragHandle";

// Pure component for remove button
const RemoveButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-colors"
    aria-label="Remove from queue"
  >
    <X className="w-4 h-4" />
  </button>
));

RemoveButton.displayName = "RemoveButton";

// Pure function to compute sortable styles
const computeSortableStyles = (
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
  transition: string | undefined,
  isDragging: boolean
) => ({
  transform: CSS.Transform.toString(transform),
  transition: transition || "",
  opacity: isDragging ? 0.5 : 1,
});

// Main component
export const SortableSongItem = memo(function SortableSongItem({
  id,
  musicId,
  title,
  artist,
  album,
  duration,
  onPlay,
  onRemove,
  className = "",
}: SortableSongItemProps) {
  // Memoize the song object to prevent unnecessary re-renders
  const song = React.useMemo(
    () => ({
      id,
      musicId,
      title,
      artist,
      album,
      duration,
    }),
    [id, musicId, title, artist, album, duration]
  );

  // Get sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Memoize the play handler
  const handlePlay = useCallback(() => {
    onPlay(song);
  }, [onPlay, song]);

  // Memoize the remove handler
  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [onRemove, id]);

  // Memoize the computed styles
  const style = React.useMemo(
    () => computeSortableStyles(transform, transition, isDragging),
    [transform, transition, isDragging]
  );

  // Memoize the class name
  const containerClassName = React.useMemo(
    () => `relative group ${className}`,
    [className]
  );

  return (
    <div ref={setNodeRef} style={style} className={containerClassName}>
      <DragHandle attributes={attributes} listeners={listeners} />
      <div className="pl-8 pr-8">
        <SongItem
          id={musicId}
          title={title}
          artist={artist}
          album={album}
          duration={duration}
          onPlay={handlePlay}
        />
      </div>
      <RemoveButton onClick={handleRemove} />
    </div>
  );
});

SortableSongItem.displayName = "SortableSongItem";
