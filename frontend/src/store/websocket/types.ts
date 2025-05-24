export interface WebSocketSessionContextType {
  isConnected: boolean;
  currentMusicId: number | null;
  listeners: Array<{
    username: string;
    position: number;
  }>;
  connect: () => void;
  disconnect: () => void;
  joinSession: (musicId: number) => void;
  leaveSession: () => void;
}

export interface Listener {
  username: string;
  position: number;
}

type WebSocketPayload =
  | { music_id: number } // join_session
  | Record<string, never> // pause, resume, get_listeners
  | { p: number } // seek, progress
  | { u: string; p?: number } // user_joined, user_left
  | { l: Listener[] } // current_listeners
  | { message: string }; // error

export interface WebSocketMessage {
  t: string;
  p: WebSocketPayload;
}

export const INACTIVITY_TIMEOUT = 30000; // 30 seconds
export const INACTIVITY_CHECK_INTERVAL = 5000; // 5 seconds
