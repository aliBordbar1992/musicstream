"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { PlayerTrack } from "@/types/domain";
import { PlayerState, PlayerAction } from "@/types/state";
import { PlayerContextType } from "@/types/context";

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
