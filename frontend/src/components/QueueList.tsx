"use client";

import React from 'react';
import { useQueue } from '../context/QueueContext';
import { SongItem } from './SongItem';

export function QueueList() {
  const { queue, loading, error } = useQueue();

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
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!queue || queue.items.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No songs in queue
      </div>
    );
  }

  // Sort items by type and position
  const sortedItems = [...queue.items].sort((a, b) => {
    if (a.type === 'next' && b.type !== 'next') return -1;
    if (a.type !== 'next' && b.type === 'next') return 1;
    return a.position - b.position;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{queue.name}</h2>
      <div className="space-y-2">
        {sortedItems.map((item) => (
          <SongItem
            key={item.id}
            id={item.music.id}
            title={item.music.title}
            artist={item.music.artist.name}
            album={item.music.album}
            duration={item.music.duration}
            onPlay={() => {
              // TODO: Implement play functionality
              console.log('Play song:', item.music.id);
            }}
          />
        ))}
      </div>
    </div>
  );
} 