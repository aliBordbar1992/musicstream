export interface WebSocketSessionContextType {
  isConnected: boolean;
  currentMusicId: number | null;
  listeners: Array<{
    username: string;
    position: number;
  }>;

  disconnect: () => void;
}

export interface Listener {
  username: string;
  position: number;
}

export type WebSocketPayload =
  | { music_id: number; position: number | null } // join_session
  | Record<string, never> // pause, resume, get_listeners
  | { p: number } // seek, progress
  | { u: string; p?: number } // user_joined, user_left
  | { l: Listener[] } // current_listeners
  | { message: string }; // error

export interface WebSocketMessage {
  t: string;
  p: WebSocketPayload;
}

// Raw message type that WebSocket actually sends/receives
export type RawMessage = string | ArrayBuffer | Blob;

export const INACTIVITY_TIMEOUT = 30000; // 30 seconds
export const INACTIVITY_CHECK_INTERVAL = 5000; // 5 seconds
