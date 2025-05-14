"use client";

import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';

interface SongItemProps {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  image?: string;
  onPlay: () => void;
  onRemove?: () => void;
  showImage?: boolean;
  className?: string;
}

export function SongItem({ 
  id, 
  title, 
  artist, 
  album, 
  duration, 
  image,
  onPlay, 
  onRemove,
  showImage = false,
  className = ""
}: SongItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { addToQueue, addToNext } = useQueue();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayNext = async () => {
    await addToNext(id);
    setShowMenu(false);
  };

  const handleAddToQueue = async () => {
    await addToQueue(id);
    setShowMenu(false);
  };

  return (
    <div className={`flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg group ${className}`}>
      <div className="flex items-center space-x-4 flex-1">
        {showImage && image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <button
          onClick={onPlay}
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{artist}</p>
        </div>
        {album && <div className="text-sm text-gray-500 dark:text-gray-400">{album}</div>}
        {duration && <div className="text-sm text-gray-500 dark:text-gray-400">{formatDuration(duration)}</div>}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={handlePlayNext}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                Play Next
              </button>
              <button
                onClick={handleAddToQueue}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                Add to Queue
              </button>
              {onRemove && (
                <button
                  onClick={() => {
                    onRemove();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 