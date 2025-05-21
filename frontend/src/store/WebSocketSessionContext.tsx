"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { eventBus, EventTypes } from "@/lib/eventBus";
import { useAuth } from "./AuthContext";
import { API_URL } from "@/lib/api";
import Cookies from "js-cookie";
import { PlayerTrack } from "@/types/domain";

interface WebSocketSessionContextType {
  isConnected: boolean;
  currentMusicId: number | null;
  listeners: Array<{
    username: string;
    position: number;
  }>;
  connect: (musicId: number) => void;
  disconnect: () => void;
}

const WebSocketSessionContext =
  createContext<WebSocketSessionContextType | null>(null);

export function WebSocketSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentMusicId, setCurrentMusicId] = useState<number | null>(null);
  const [listeners, setListeners] = useState<
    Array<{ username: string; position: number }>
  >([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);

  // Handle WebSocket messages
  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      switch (data.t) {
        case "user_joined":
          eventBus.emit("session:userJoined", {
            username: data.p.u,
            position: data.p.p || 0,
          });
          break;
        case "user_left":
          eventBus.emit("session:userLeft", { username: data.p.u });
          break;
        case "progress":
          eventBus.emit("session:progressUpdate", {
            username: data.p.u,
            position: data.p.p,
          });
          break;
        case "seek":
          eventBus.emit("session:seekUpdate", {
            username: data.p.u,
            position: data.p.p,
          });
          break;
        case "pause":
          eventBus.emit("session:pauseUpdate", { username: data.p.u });
          break;
        case "resume":
          eventBus.emit("session:resumeUpdate", { username: data.p.u });
          break;
        case "current_listeners":
          // Handle the response to get_listeners request
          const listeners = data.p.l.map(
            (l: { username: string; position: number }) => ({
              username: l.username,
              position: l.position,
            })
          );
          setListeners(listeners);
          break;
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
      eventBus.emit("session:error", {
        message: "Failed to parse WebSocket message",
      });
    }
  };

  // Connect to WebSocket
  const connect = (musicId: number) => {
    console.log("Connecting to WebSocket");
    if (!user) {
      eventBus.emit("session:error", { message: "User not authenticated" });
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      const wsUrl = API_URL.replace(/^http/, "ws");
      const token = Cookies.get("token");
      if (!token) {
        eventBus.emit("session:error", {
          message: "No authentication token found",
        });
        return;
      }

      const ws = new WebSocket(
        `${wsUrl}/ws/listen?music_id=${musicId}&token=${token}`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setCurrentMusicId(musicId);
        eventBus.emit("session:connected");

        // Request current listeners after connection
        ws.send(
          JSON.stringify({
            t: "get_listeners",
            p: {},
          })
        );
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event);
        setIsConnected(false);
        setCurrentMusicId(null);
        setListeners([]);
        eventBus.emit("session:disconnected");

        // Attempt to reconnect if the connection was lost
        if (event.code !== 1000) {
          // 1000 is a normal closure
          reconnectTimeoutRef.current = setTimeout(() => {
            if (currentMusicId) {
              connect(currentMusicId);
            }
          }, 5000); // Try to reconnect after 5 seconds
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        eventBus.emit("session:error", {
          message: "WebSocket connection error",
        });
      };

      ws.onmessage = handleMessage;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      eventBus.emit("session:error", {
        message: "Failed to create WebSocket connection",
      });
    }
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    console.log("Disconnecting from WebSocket");
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setListeners([]);
    setIsConnected(false);
    setCurrentMusicId(null);
  };

  // Listen to music player events
  useEffect(() => {
    const handlePlay = (track: PlayerTrack) => {
      if (!isConnected) {
        connect(track.id);
      }
    };

    const handleClear = () => {
      disconnect();
    };

    const handlePause = () => {
      console.log("Sending pause event");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            t: "pause",
            p: {},
          })
        );
      }
    };

    const handleResume = () => {
      console.log("Sending resume event");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            t: "resume",
            p: {},
          })
        );
      }
    };

    const handleSeek = (position: number) => {
      console.log("Sending seek event");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            t: "seek",
            p: { p: position },
          })
        );
      }
    };

    const handleProgress = (position: number) => {
      const now = Date.now();
      if (now - lastProgressUpdateRef.current >= 1000) {
        // Only send if 1 second has passed
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              t: "progress",
              p: { p: position },
            })
          );
          lastProgressUpdateRef.current = now;
        }
      }
    };

    // Subscribe to events
    eventBus.on("player:play", handlePlay);
    eventBus.on("player:clear", handleClear);
    eventBus.on("player:pause", handlePause);
    eventBus.on("player:resume", handleResume);
    eventBus.on("player:seek", handleSeek);
    eventBus.on("player:progress", handleProgress);

    // Cleanup
    return () => {
      eventBus.off("player:play", handlePlay);
      eventBus.off("player:clear", handleClear);
      eventBus.off("player:pause", handlePause);
      eventBus.off("player:resume", handleResume);
      eventBus.off("player:seek", handleSeek);
      eventBus.off("player:progress", handleProgress);
      disconnect();
    };
  }, []);

  // Update listeners when session events occur
  useEffect(() => {
    const handleUserJoined = (data: EventTypes["session:userJoined"]) => {
      setListeners((prev) => [
        ...prev,
        { username: data.username, position: data.position },
      ]);
    };

    const handleUserLeft = (data: EventTypes["session:userLeft"]) => {
      setListeners((prev) => prev.filter((l) => l.username !== data.username));
    };

    const handleProgressUpdate = (
      data: EventTypes["session:progressUpdate"]
    ) => {
      setListeners((prev) =>
        prev.map((l) =>
          l.username === data.username ? { ...l, position: data.position } : l
        )
      );
    };

    eventBus.on("session:userJoined", handleUserJoined);
    eventBus.on("session:userLeft", handleUserLeft);
    eventBus.on("session:progressUpdate", handleProgressUpdate);

    return () => {
      eventBus.off("session:userJoined", handleUserJoined);
      eventBus.off("session:userLeft", handleUserLeft);
      eventBus.off("session:progressUpdate", handleProgressUpdate);
    };
  }, []);

  return (
    <WebSocketSessionContext.Provider
      value={{
        isConnected,
        currentMusicId,
        listeners,
        connect,
        disconnect,
      }}
    >
      {children}
    </WebSocketSessionContext.Provider>
  );
}

export function useWebSocketSession() {
  const context = useContext(WebSocketSessionContext);
  if (!context) {
    throw new Error(
      "useWebSocketSession must be used within a WebSocketSessionProvider"
    );
  }
  return context;
}
