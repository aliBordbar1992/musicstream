import { useRef, useState } from "react";
import { API_URL } from "@/lib/api";
import Cookies from "js-cookie";
import { eventBus } from "@/lib/eventBus";
import {
  INACTIVITY_TIMEOUT,
  INACTIVITY_CHECK_INTERVAL,
  WebSocketMessage,
} from "./types";

export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueue = useRef<WebSocketMessage[]>([]);
  const isReconnecting = useRef(false);

  const updateLastActivity = () => {
    lastActivityRef.current = Date.now();
  };

  const checkInactivity = () => {
    const now = Date.now();
    if (now - lastActivityRef.current >= INACTIVITY_TIMEOUT) {
      console.log("Inactivity timeout reached, disconnecting WebSocket");
      disconnect();
    }
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
      const message = messageQueue.current[0];
      try {
        wsRef.current.send(JSON.stringify(message));
        messageQueue.current.shift(); // Remove the sent message
      } catch (error) {
        console.error("Failed to send message:", error);
        break; // Stop processing if we encounter an error
      }
    }
  };

  const connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isConnected || isConnecting) {
        console.log(
          "Already connected or connecting, skipping connection attempt"
        );
        resolve();
        return;
      }

      console.log("Connecting to WebSocket");
      setIsConnecting(true);
      const token = Cookies.get("token");
      if (!token) {
        const error = new Error("No authentication token found");
        eventBus.emit("session:error", {
          message: error.message,
        });
        setIsConnecting(false);
        reject(error);
        return;
      }

      // Close existing connection if any
      if (
        wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }

      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        const error = new Error("WebSocket connection timeout");
        eventBus.emit("session:error", {
          message: error.message,
        });
        setIsConnecting(false);
        if (wsRef.current) {
          wsRef.current.close();
        }
        reject(error);
      }, 10000); // 10 second timeout

      try {
        const wsUrl = API_URL.replace(/^http/, "ws");
        const ws = new WebSocket(`${wsUrl}/ws/listen?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected");
          clearTimeout(connectionTimeout);
          setIsConnected(true);
          setIsConnecting(false);
          eventBus.emit("session:connected");
          updateLastActivity();

          // Start inactivity check interval
          if (inactivityCheckIntervalRef.current) {
            clearInterval(inactivityCheckIntervalRef.current);
          }
          inactivityCheckIntervalRef.current = setInterval(
            checkInactivity,
            INACTIVITY_CHECK_INTERVAL
          );

          // Process any queued messages
          processMessageQueue().catch(console.error);

          resolve();
        };

        ws.onclose = (event) => {
          console.log("WebSocket closed:", event);
          clearTimeout(connectionTimeout);
          setIsConnected(false);
          setIsConnecting(false);
          eventBus.emit("session:disconnected");

          // Clear inactivity check interval
          if (inactivityCheckIntervalRef.current) {
            clearInterval(inactivityCheckIntervalRef.current);
            inactivityCheckIntervalRef.current = null;
          }

          // Attempt to reconnect if the connection was lost
          if (event.code !== 1000) {
            // 1000 is a normal closure
            reconnectTimeoutRef.current = setTimeout(() => {
              connect().catch(console.error);
            }, 5000); // Try to reconnect after 5 seconds
          }

          if (event.code !== 1000) {
            reject(new Error(`WebSocket closed with code ${event.code}`));
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          clearTimeout(connectionTimeout);
          setIsConnecting(false);
          const wsError = new Error("WebSocket connection error");
          eventBus.emit("session:error", {
            message: wsError.message,
          });
          reject(wsError);
        };
      } catch (error) {
        clearTimeout(connectionTimeout);
        console.error("Failed to create WebSocket connection:", error);
        setIsConnecting(false);
        const wsError = new Error("Failed to create WebSocket connection");
        eventBus.emit("session:error", {
          message: wsError.message,
        });
        reject(wsError);
      }
    });
  };

  const disconnect = () => {
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
  };

  const sendMessage = async (message: WebSocketMessage) => {
    updateLastActivity();

    // If WebSocket is not open, try to reconnect
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not open, attempting to reconnect...");

      // Add message to queue
      messageQueue.current.push(message);

      // If already reconnecting, just queue the message
      if (isReconnecting.current) {
        return;
      }

      try {
        isReconnecting.current = true;
        await connect();
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
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error("Failed to send message:", error);
      // If send fails, queue the message and attempt reconnection
      messageQueue.current.push(message);
      try {
        isReconnecting.current = true;
        await connect();
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

  return {
    isConnected,
    isConnecting,
    wsRef,
    connect,
    disconnect,
    sendMessage,
    updateLastActivity,
  };
}
