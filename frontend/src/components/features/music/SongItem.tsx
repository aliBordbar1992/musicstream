"use client";

import { memo, useCallback } from "react";
import { formatDuration } from "@/utils/formatDuration";
import Image from "next/image";
import { Music } from "@/types/domain";
import { Trash2 } from "lucide-react";

interface SongItemProps {
  song: Music;
  onPlay: (song: Music) => void;
  onRemove?: (song: Music) => void;
  showImage?: boolean;
  className?: string;
  showRemoveButton?: boolean;
}

export const SongItem = memo(function SongItem({
  song,
  onPlay,
  onRemove,
  showImage = false,
  className = "",
  showRemoveButton = false,
}: SongItemProps) {
  const handlePlay = useCallback(() => {
    onPlay(song);
  }, [onPlay, song]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(song);
    }
  }, [onRemove, song]);

  return (
    <div
      className={`flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg group ${className}`}
    >
      <div className="flex items-center space-x-4 flex-1">
        {showImage && song.image && (
          <div className="w-16 h-16 rounded-lg flex-shrink-0">
            <Image
              src={song.image}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <button
          onClick={handlePlay}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {song.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {typeof song.artist === "string" ? song.artist : song.artist.name}
          </p>
        </div>
        {song.album && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {song.album}
          </div>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDuration(song.duration)}
        </div>
        {showRemoveButton && onRemove && (
          <button
            className="ml-4 p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            onClick={handleRemove}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});
