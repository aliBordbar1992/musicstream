"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";

export interface PlayerTrack {
  id: number;
  title: string;
  artist: string;
  duration: number;
  image?: string;
  url?: string;
}

interface PlayerState {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
}

type PlayerAction =
  | { type: "PLAY_TRACK"; payload: PlayerTrack }
  | { type: "PAUSE" }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_TRACK"; payload: PlayerTrack | null };

interface PlayerContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  playTrack: (track: PlayerTrack) => void;
  pause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: PlayerTrack | null) => void;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "PLAY_TRACK":
      return {
        currentTrack: action.payload,
        isPlaying: true,
      };
    case "PAUSE":
      return {
        ...state,
        isPlaying: false,
      };
    case "SET_PLAYING":
      return {
        ...state,
        isPlaying: action.payload,
      };
    case "SET_TRACK":
      return {
        ...state,
        currentTrack: action.payload,
      };
    default:
      return state;
  }
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  const playTrack = useCallback((track: PlayerTrack) => {
    dispatch({ type: "PLAY_TRACK", payload: track });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE" });
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    dispatch({ type: "SET_PLAYING", payload: playing });
  }, []);

  const setCurrentTrack = useCallback((track: PlayerTrack | null) => {
    dispatch({ type: "SET_TRACK", payload: track });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack: state.currentTrack,
        isPlaying: state.isPlaying,
        playTrack,
        pause,
        setIsPlaying,
        setCurrentTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context)
    throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}
