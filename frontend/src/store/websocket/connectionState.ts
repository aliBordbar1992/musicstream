import { INACTIVITY_CHECK_INTERVAL } from "./types";

export type ConnectionState = {
  isConnected: boolean;
  isConnecting: boolean;
  lastActivity: number;
};

export type ConnectionAction =
  | { type: "CONNECTING" }
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" }
  | { type: "ERROR" }
  | { type: "ACTIVITY_UPDATE" };

export function connectionReducer(
  state: ConnectionState,
  action: ConnectionAction
): ConnectionState {
  switch (action.type) {
    case "CONNECTING":
      return { ...state, isConnecting: true };
    case "CONNECTED":
      return { ...state, isConnected: true, isConnecting: false };
    case "DISCONNECTED":
      return { ...state, isConnected: false, isConnecting: false };
    case "ERROR":
      return { ...state, isConnecting: false };
    case "ACTIVITY_UPDATE":
      return { ...state, lastActivity: Date.now() };
    default:
      return state;
  }
}

export const initialConnectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  lastActivity: Date.now(),
};

export type ConnectionManager = {
  state: ConnectionState;
  dispatch: (action: ConnectionAction) => void;
  refs: {
    ws: React.RefObject<WebSocket | null>;
    reconnectTimeout: React.RefObject<NodeJS.Timeout | null>;
    inactivityCheckInterval: React.RefObject<NodeJS.Timeout | null>;
    messageHandler: React.RefObject<((event: MessageEvent) => void) | null>;
  };
};
