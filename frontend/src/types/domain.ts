// Music domain types
export interface Music {
  id: number;
  title: string;
  artist: Artist;
  album?: string;
  duration: number;
  url: string;
  image?: string;
}

export interface Artist {
  id: number;
  name: string;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  image?: string;
  played_at?: string;
}

// Queue domain types
export interface QueueItem {
  id: number;
  music: Music;
  type: "next" | "queue";
  position: number;
}

export interface Queue {
  id: number;
  name: string;
  items: QueueItem[];
}

// Player domain types
export interface PlayerTrack {
  id: number;
  title: string;
  artist: string;
  duration: number;
  image?: string;
  url?: string;
  position: number | null;
}

// User domain types
export interface User {
  username: string;
  name?: string | null;
  profile_picture?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Playlist domain types
export interface Playlist {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string; // ISO date string
  songs?: Music[]; // Optional since it's omitted in some cases
  is_owner: boolean;
}

export type ListenerState =
  | "paused"
  | "playing"
  | "fast_forward"
  | "rewind"
  | "seeking";

export interface Listener {
  username: string;
  name: string | null;
  profile_picture: string | null;
  position: number;
  state: ListenerState;
}

export type WebSocketMessageType =
  | "join_session"
  | "leave_session"
  | "play"
  | "pause"
  | "resume"
  | "progress"
  | "seek"
  | "get_listeners"
  | "user_joined"
  | "user_left"
  | "current_listeners";

export type WebSocketPayload = {
  join_session: { music_id: number; position: number };
  leave_session: Record<string, never>;
  play: { music_id: number; timestamp: number };
  get_listeners: Record<string, never>;
  user_joined: { u: string; n: string | null; pp: string | null; p?: number };
  user_left: { u: string };
  progress: { u: string; p: number };
  seek: { u: string; p: number };
  pause: { u: string };
  resume: { u: string };
  current_listeners: {
    l: Array<{
      u: string;
      n: string | null;
      pp: string | null;
      p?: number;
    }>;
  };
};

export interface WebSocketMessage {
  t: WebSocketMessageType;
  p: WebSocketPayload[WebSocketMessageType];
}

// Raw message type that WebSocket actually sends/receives
export type RawMessage = string | ArrayBuffer | Blob;

export const INACTIVITY_TIMEOUT = 30000; // 30 seconds
export const INACTIVITY_CHECK_INTERVAL = 5000; // 5 seconds

export type PlayerEventType =
  | "play"
  | "pause"
  | "resume"
  | "progress"
  | "close"
  | "seek";

export interface PlayerEvent {
  type: PlayerEventType;
  musicId?: number;
  progress?: number;
  timestamp: number;
}

export interface SessionState {
  sessionId: string | null;
  musicId: number | null;
  isActive: boolean;
  username: string | null;
  position: number | null;
  isClosed: boolean;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastActivity: number;
}

export interface QueuedEvent {
  event: PlayerEvent;
  timestamp: number;
}

export class EventQueue {
  private queue: QueuedEvent[] = [];
  private readonly maxQueueSize: number;

  constructor(maxQueueSize: number = 100) {
    this.maxQueueSize = maxQueueSize;
  }

  enqueue(event: PlayerEvent): void {
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Remove oldest event if queue is full
    }
    this.queue.push({
      event,
      timestamp: Date.now(),
    });
  }

  dequeue(): QueuedEvent | undefined {
    return this.queue.shift();
  }

  peek(): QueuedEvent | undefined {
    return this.queue[0];
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  clear(): void {
    this.queue = [];
  }

  get length(): number {
    return this.queue.length;
  }
}
