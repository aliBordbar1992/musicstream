import { useRef, useState, useCallback, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import {
  INACTIVITY_TIMEOUT,
  INACTIVITY_CHECK_INTERVAL,
  RawMessage,
} from "./types";
import { connect } from "./utils";

// Message queue type
type QueuedMessage = {
  message: RawMessage;
  timestamp: number;
};

export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueue = useRef<QueuedMessage[]>([]);
  const isReconnecting = useRef(false);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

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
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const checkInactivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current >= INACTIVITY_TIMEOUT) {
      console.log("Inactivity timeout reached, disconnecting WebSocket");
      disconnect();
    }
  }, [disconnect]);

  const cc = useCallback(async () => {
    console.log("cc called", isConnected, isConnecting);
    await connect(
      isConnected,
      isConnecting,
      setIsConnected,
      setIsConnecting,
      wsRef,
      reconnectTimeoutRef,
      messageHandlerRef,
      updateLastActivity,
      checkInactivity,
      inactivityCheckIntervalRef,
      INACTIVITY_CHECK_INTERVAL,
      processMessageQueue
    );
  }, [checkInactivity, isConnected, isConnecting]);

  useEffect(() => {
    console.log("isConnected", isConnected);
    if (!isConnected && !isConnecting) {
      cc();
    }
  }, [cc, isConnected, isConnecting]);

  const updateLastActivity = () => {
    lastActivityRef.current = Date.now();
  };

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
        messageQueue.current.shift(); // Remove the sent message
      } catch (error) {
        console.error("Failed to send message:", error);
        break; // Stop processing if we encounter an error
      }
    }
  };

  const sendMessage = async (message: RawMessage) => {
    updateLastActivity();

    // If WebSocket is not open, try to reconnect
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not open, attempting to reconnect...");

      // Add message to queue
      messageQueue.current.push({
        message,
        timestamp: Date.now(),
      });

      // If already reconnecting, just queue the message
      if (isReconnecting.current) {
        return;
      }

      try {
        isReconnecting.current = true;
        await cc();
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

    // If WebSocket is open, send message directly
    try {
      wsRef.current.send(message);
    } catch (error) {
      console.error("Failed to send message:", error);
      // If send fails, queue the message and attempt reconnection
      messageQueue.current.push({
        message,
        timestamp: Date.now(),
      });
      try {
        isReconnecting.current = true;
        await cc();
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

  // Set message handler
  const setMessageHandler = useCallback(
    (handler: (event: MessageEvent) => void) => {
      messageHandlerRef.current = handler;
    },
    []
  );

  return {
    isConnected,
    isConnecting,
    wsRef,
    connect: cc,
    disconnect,
    sendMessage,
    updateLastActivity,
    setMessageHandler,
  };
}
