import { Queue } from "./domain";
import { PlayerTrack } from "./domain";
import { User } from "./domain";

// Queue context types
export interface QueueContextType {
  queue: Queue | null;
  loading: boolean;
  error: string | null;
  createQueue: (name: string) => Promise<void>;
  getQueue: () => Promise<void>;
  addToQueue: (musicId: number, type: "next" | "queue") => Promise<void>;
  removeFromQueue: (itemId: number) => Promise<void>;
  clearQueue: () => Promise<void>;
}

// Player context types
export interface PlayerContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  playTrack: (track: PlayerTrack) => void;
  pause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: PlayerTrack | null) => void;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Queue sidebar context types
export interface QueueSidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}
