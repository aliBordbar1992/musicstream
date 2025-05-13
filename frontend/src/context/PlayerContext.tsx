'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PlayerTrack {
  id: number;
  title: string;
  artist: string;
  duration: number;
  image?: string;
  url?: string;
}

interface PlayerContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  playTrack: (track: PlayerTrack) => void;
  pause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: PlayerTrack | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = (track: PlayerTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, pause, setIsPlaying, setCurrentTrack }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
} 