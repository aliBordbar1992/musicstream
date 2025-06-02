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
import { eventBus } from "@/lib/eventBus";

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "PLAY_TRACK":
      console.log("PLAY_TRACK", action.payload);
      return {
        currentTrack: action.payload,
        isPlaying: true,
      };
    case "CLEAR_TRACK":
      return {
        ...state,
        isPlaying: false,
        currentTrack: null,
      };
    case "PAUSE":
      return {
        ...state,
        isPlaying: false,
      };
    case "RESUME":
      return {
        ...state,
        isPlaying: true,
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

  const playTrack = useCallback(
    (track: PlayerTrack) => {
      // If the track is already playing, do nothing
      if (state.currentTrack?.id === track.id) {
        return;
      }

      dispatch({ type: "PLAY_TRACK", payload: track });
      eventBus.emit("player:play", {
        type: "play",
        timestamp: Date.now(),
        musicId: track.id,
      });
    },
    [state.currentTrack?.id]
  );

  const clearTrack = useCallback(() => {
    dispatch({ type: "CLEAR_TRACK" });
    eventBus.emit("player:close", {
      type: "close",
      timestamp: Date.now(),
      musicId: state.currentTrack?.id,
    });
  }, [state.currentTrack?.id]);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE" });
    eventBus.emit("player:pause", {
      type: "pause",
      timestamp: Date.now(),
      musicId: state.currentTrack?.id,
    });
  }, [state.currentTrack?.id]);

  const resume = useCallback(() => {
    dispatch({ type: "RESUME" });
    eventBus.emit("player:resume", {
      type: "resume",
      timestamp: Date.now(),
      musicId: state.currentTrack?.id,
    });
  }, [state.currentTrack?.id]);

  const setCurrentTrack = useCallback((track: PlayerTrack | null) => {
    dispatch({ type: "SET_TRACK", payload: track });
  }, []);

  const seek = useCallback(
    (position: number) => {
      eventBus.emit("player:seek", {
        type: "seek",
        timestamp: Date.now(),
        musicId: state.currentTrack?.id,
        progress: position,
      });
    },
    [state.currentTrack?.id]
  );

  const updateProgress = useCallback(
    (progress: number) => {
      eventBus.emit("player:progress", {
        type: "progress",
        timestamp: Date.now(),
        musicId: state.currentTrack?.id,
        progress: progress,
      });
    },
    [state.currentTrack?.id]
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack: state.currentTrack,
        isPlaying: state.isPlaying,
        playTrack,
        pause,
        resume,
        setCurrentTrack,
        seek,
        updateProgress,
        clearTrack,
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
