export interface WebSocketSessionContextType {
  isConnected: boolean;
  currentMusicId: number | null;
  listeners: Array<Listener>;

  disconnect: () => void;
}

export type ListenerState =
  | "paused"
  | "playing"
  | "fast_forward"
  | "rewind"
  | "seeking";

export interface Listener {
  username: string;
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
  user_joined: { u: string; p?: number };
  user_left: { u: string };
  progress: { u: string; p: number };
  seek: { u: string; p: number };
  pause: { u: string };
  resume: { u: string };
  current_listeners: { l: Listener[] };
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
