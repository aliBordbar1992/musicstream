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
  updateQueueItemPosition: (itemId: number, position: number) => Promise<void>;
}

// Player context types
export interface PlayerContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  playTrack: (track: PlayerTrack) => void;
  pause: () => void;
  resume: () => void;
  setCurrentTrack: (track: PlayerTrack | null) => void;
  seek: (position: number) => void;
  updateProgress: (progress: number) => void;
  clearTrack: () => void;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  handleUnauthorized: () => void;
}

// Queue sidebar context types
export interface QueueSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
