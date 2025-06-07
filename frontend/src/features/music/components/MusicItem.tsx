"use client";

import { memo } from "react";
import { formatDuration } from "@/utils/formatDuration";
import Image from "next/image";

import { Music } from "@/types";
import { PlayIcon, TrashIcon } from "lucide-react";
export interface MusicItemProps {
  music: Music;
  showImage?: boolean;
  className?: string;
  showRemoveButton?: boolean;
  onPlay: (song: Music) => void;
  onRemove?: (song: Music) => void;
}

export const MusicItem = memo(function SongItem({
  music,
  showImage = false,
  className = "",
  showRemoveButton = false,
  onPlay,
  onRemove,
}: MusicItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg group ${className}`}
    >
      <div className="flex items-center space-x-4 flex-1">
        {showImage && music.image && (
          <div className="w-16 h-16 rounded-lg flex-shrink-0">
            <Image
              src={music.image}
              alt={music.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <button
          onClick={() => onPlay(music)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <PlayIcon className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {music.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {typeof music.artist === "string"
              ? music.artist
              : music.artist.name}
          </p>
        </div>
        {music.album && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {music.album}
          </div>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDuration(music.duration)}
        </div>
        {showRemoveButton && onRemove && (
          <button
            className="ml-4 p-2 rounded-full text-red-600 hover:bg-red-200 dark:text-red-400 dark:hover:bg-red-900 transition-colors"
            onClick={() => onRemove(music)}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});
