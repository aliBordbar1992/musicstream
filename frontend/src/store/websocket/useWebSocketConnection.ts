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

  const connect = () => {
    if (isConnected || isConnecting) {
      console.log(
        "Already connected or connecting, skipping connection attempt"
      );
      return;
    }

    console.log("Connecting to WebSocket");
    setIsConnecting(true);
    const token = Cookies.get("token");
    if (!token) {
      eventBus.emit("session:error", {
        message: "No authentication token found",
      });
      setIsConnecting(false);
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

    try {
      const wsUrl = API_URL.replace(/^http/, "ws");
      const ws = new WebSocket(`${wsUrl}/ws/listen?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
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
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event);
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
            connect();
          }, 5000); // Try to reconnect after 5 seconds
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnecting(false);
        eventBus.emit("session:error", {
          message: "WebSocket connection error",
        });
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnecting(false);
      eventBus.emit("session:error", {
        message: "Failed to create WebSocket connection",
      });
    }
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

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("Sending message:", message);
      updateLastActivity();
      wsRef.current.send(JSON.stringify(message));
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
