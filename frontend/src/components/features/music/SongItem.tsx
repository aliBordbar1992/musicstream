"use client";

import { memo, useCallback } from "react";
import { formatDuration } from "../utils/formatDuration";
import Image from "next/image";

interface SongItemProps {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  image?: string;
  onPlay: () => void;
  showImage?: boolean;
  className?: string;
}

export const SongItem = memo(function SongItem({
  title,
  artist,
  album,
  duration,
  image,
  onPlay,
  showImage = false,
  className = "",
}: SongItemProps) {
  const handlePlay = useCallback(() => {
    onPlay();
  }, [onPlay]);

  return (
    <div
      className={`flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg group ${className}`}
    >
      <div className="flex items-center space-x-4 flex-1">
        {showImage && image && (
          <div className="w-16 h-16 rounded-lg flex-shrink-0">
            <Image
              src={image}
              alt={title}
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
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{artist}</p>
        </div>
        {album && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {album}
          </div>
        )}
        {duration !== undefined && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatDuration(duration)}
          </div>
        )}
      </div>
    </div>
  );
});
