import { useRef, useReducer, useCallback, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import { RawMessage } from "./types";
import { connect } from "./utils";
import {
  connectionReducer,
  initialConnectionState,
  ConnectionManager,
} from "./connectionState";

// Message queue type
type QueuedMessage = {
  message: RawMessage;
  timestamp: number;
};

export function useWebSocketConnection() {
  const [state, dispatch] = useReducer(
    connectionReducer,
    initialConnectionState
  );
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueue = useRef<QueuedMessage[]>([]);
  const isReconnecting = useRef(false);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );
  const connectionAttemptRef = useRef<Promise<void> | null>(null);

  // Create a stable ref for the connection manager
  const managerRef = useRef<ConnectionManager>({
    state,
    dispatch,
    refs: {
      ws: wsRef,
      reconnectTimeout: reconnectTimeoutRef,
      inactivityCheckInterval: inactivityCheckIntervalRef,
      messageHandler: messageHandlerRef,
    },
  });

  // Update the manager's state reference when state changes
  useEffect(() => {
    console.log("useWebSocketConnection useEffect mount", state);
    managerRef.current.state = state;
  }, [state]);

  const disconnect = useCallback(() => {
    console.log("Disconnecting from WebSocket");
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (inactivityCheckIntervalRef.current) {
      clearInterval(inactivityCheckIntervalRef.current);
      inactivityCheckIntervalRef.current = null;
    }
    dispatch({ type: "DISCONNECTED" });
  }, []);

  const updateLastActivity = useCallback(() => {
    dispatch({ type: "ACTIVITY_UPDATE" });
  }, []);

  const processMessageQueue = async () => {
    if (
      messageQueue.current.length === 0 ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    while (messageQueue.current.length > 0) {
      const { message } = messageQueue.current[0];
      try {
        wsRef.current.send(message);
        messageQueue.current.shift();
      } catch (error) {
        console.error("Failed to send message:", error);
        break;
      }
    }
  };

  const connectWebSocket = useCallback(async () => {
    console.log("connectWebSocket called", state);

    // If we're already connected or connecting, don't try to connect again
    if (state.isConnected || state.isConnecting) {
      console.log(
        "Already connected or connecting, skipping connection attempt"
      );
      return;
    }

    // If there's an ongoing connection attempt, wait for it
    if (connectionAttemptRef.current) {
      console.log("Connection attempt in progress, waiting...");
      await connectionAttemptRef.current;
      return;
    }

    // Start a new connection attempt
    dispatch({ type: "CONNECTING" });
    connectionAttemptRef.current = connect(managerRef.current);

    try {
      await connectionAttemptRef.current;
    } finally {
      connectionAttemptRef.current = null;
    }
  }, [state.isConnected, state.isConnecting]);

  useEffect(() => {
    console.log(
      "useEffect connectWebSocket",
      state.isConnected,
      state.isConnecting
    );
    if (!state.isConnected && !state.isConnecting) {
      connectWebSocket();
    }
  }, [state.isConnected, state.isConnecting, connectWebSocket]);

  const sendMessage = async (message: RawMessage) => {
    updateLastActivity();

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not open, attempting to reconnect...");

      messageQueue.current.push({
        message,
        timestamp: Date.now(),
      });

      if (isReconnecting.current) {
        return;
      }

      try {
        isReconnecting.current = true;
        await connectWebSocket();
        await processMessageQueue();
      } catch (error) {
        console.error("Failed to reconnect:", error);
        eventBus.emit("session:error", {
          message: "Failed to reconnect to WebSocket",
        });
      } finally {
        isReconnecting.current = false;
      }
      return;
    }

    try {
      wsRef.current.send(message);
    } catch (error) {
      console.error("Failed to send message:", error);
      messageQueue.current.push({
        message,
        timestamp: Date.now(),
      });
      try {
        isReconnecting.current = true;
        await connectWebSocket();
        await processMessageQueue();
      } catch (error) {
        console.error("Failed to reconnect after send error:", error);
        eventBus.emit("session:error", {
          message: "Failed to reconnect to WebSocket",
        });
      } finally {
        isReconnecting.current = false;
      }
    }
  };

  const setMessageHandler = useCallback(
    (handler: (event: MessageEvent) => void) => {
      messageHandlerRef.current = handler;
    },
    []
  );

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    wsRef,
    connect: connectWebSocket,
    disconnect,
    sendMessage,
    updateLastActivity,
    setMessageHandler,
  };
}
