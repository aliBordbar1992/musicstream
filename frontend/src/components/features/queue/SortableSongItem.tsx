"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SongItem } from "./SongItem";
import { GripVertical, X } from "lucide-react";

interface SortableSongItemProps {
  id: number;
  musicId: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  onPlay: () => void;
  onRemove: () => void;
}

export function SortableSongItem({
  id,
  musicId,
  title,
  artist,
  album,
  duration,
  onPlay,
  onRemove,
}: SortableSongItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>
      <div className="pl-8 pr-8">
        <SongItem
          id={musicId}
          title={title}
          artist={artist}
          album={album}
          duration={duration}
          onPlay={onPlay}
        />
      </div>
      <button
        onClick={onRemove}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
