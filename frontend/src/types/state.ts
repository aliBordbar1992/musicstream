import { Queue } from "./domain";
import { PlayerTrack } from "./domain";

// Queue state types
export interface QueueState {
  queue: Queue | null;
  loading: boolean;
  error: string | null;
}

export type QueueAction =
  | { type: "SET_QUEUE"; payload: Queue }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_QUEUE" };

// Player state types
export interface PlayerState {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
}

export type PlayerAction =
  | { type: "PLAY_TRACK"; payload: PlayerTrack }
  | { type: "PAUSE" }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_TRACK"; payload: PlayerTrack | null };

// Audio player state types
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  progress: number;
}

// Queue management state types
export interface QueueManagementState {
  queue: Queue | null;
  loading: boolean;
  error: string | null;
}
