import React from "react";
import { Play } from "lucide-react";
import { formatDuration } from "@/utils/time";

interface SongItemProps {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  onPlay: () => void;
}

export function SongItem({
  title,
  artist,
  album,
  duration,
  onPlay,
}: SongItemProps) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <button
          onClick={onPlay}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <Play className="w-4 h-4" />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{title}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {artist}
            {album && ` • ${album}`}
          </span>
        </div>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
