import React, { memo, useCallback } from "react";
import { Play } from "lucide-react";
import { formatDuration } from "@/utils/time";

// Domain types
export interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
}

// Component props
export interface SongItemProps extends Song {
  onPlay: (song: Song) => void;
  className?: string;
}

// Pure function to format song details
const formatSongDetails = (artist: string, album?: string): string => {
  return album ? `${artist} • ${album}` : artist;
};

// Pure function to format duration
const formatSongDuration = (duration?: number): string => {
  return duration ? formatDuration(duration) : "";
};

// Pure component for play button
const PlayButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
    aria-label="Play song"
  >
    <Play className="w-4 h-4" />
  </button>
));

PlayButton.displayName = "PlayButton";

// Main component
export const SongItem = memo(function SongItem({
  id,
  title,
  artist,
  album,
  duration,
  onPlay,
  className = "",
}: SongItemProps) {
  // Memoize the song object to prevent unnecessary re-renders
  const song = React.useMemo(
    () => ({
      id,
      title,
      artist,
      album,
      duration,
    }),
    [id, title, artist, album, duration]
  );

  // Memoize the play handler
  const handlePlay = useCallback(() => {
    onPlay(song);
  }, [onPlay, song]);

  // Memoize formatted values
  const songDetails = React.useMemo(
    () => formatSongDetails(artist, album),
    [artist, album]
  );

  const formattedDuration = React.useMemo(
    () => formatSongDuration(duration),
    [duration]
  );

  return (
    <div
      className={`flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className}`}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <PlayButton onClick={handlePlay} />
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{title}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {songDetails}
          </span>
        </div>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
        {formattedDuration}
      </span>
    </div>
  );
});

SongItem.displayName = "SongItem";
