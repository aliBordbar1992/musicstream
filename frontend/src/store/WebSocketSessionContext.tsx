"use client";

import React, { createContext, useContext, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import { WebSocketSessionContextType } from "./websocket/types";
import { useWebSocketConnection } from "./websocket/useWebSocketConnection";
import { useSessionState } from "./websocket/useSessionState";
import { usePlayerEvents } from "./websocket/usePlayerEvents";

const WebSocketSessionContext =
  createContext<WebSocketSessionContextType | null>(null);

export function WebSocketSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isConnected,
    wsRef,
    connect,
    disconnect,
    sendMessage,
    updateLastActivity,
  } = useWebSocketConnection();
  const {
    currentMusicId,
    listeners,
    setListeners,
    handleUserJoined,
    handleUserLeft,
    handleProgressUpdate,
    joinSession,
    leaveSession,
  } = useSessionState(wsRef, updateLastActivity, sendMessage);

  /*   // Join a music session
  const joinSession = (musicId: number, position: number | null) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      joinSessionState(musicId, position, sendMessage, updateLastActivity);
    }
  };

  // Leave current music session
  const leaveSession = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      leaveSessionState(sendMessage, updateLastActivity);
    }
  }; */

  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      updateLastActivity();
      try {
        const data = JSON.parse(event.data);
        switch (data.t) {
          case "user_joined":
            handleUserJoined({
              username: data.p.u,
              position: data.p.p || 0,
            });
            break;
          case "user_left":
            handleUserLeft({ username: data.p.u });
            break;
          case "progress":
            handleProgressUpdate({
              username: data.p.u,
              position: data.p.p,
            });
            break;
          case "seek":
            handleProgressUpdate({
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
            setListeners(data.p.l);
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        eventBus.emit("session:error", {
          message: "Failed to parse WebSocket message",
        });
      }
    };

    if (wsRef.current) {
      wsRef.current.onmessage = handleMessage;
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.onmessage = null;
      }
    };
  }, [
    wsRef,
    handleUserJoined,
    handleUserLeft,
    handleProgressUpdate,
    setListeners,
    updateLastActivity,
  ]);

  // Set up player events
  usePlayerEvents(
    wsRef,
    isConnected,
    currentMusicId,
    updateLastActivity,
    connect,
    joinSession,
    leaveSession,
    sendMessage
  );

  return (
    <WebSocketSessionContext.Provider
      value={{
        isConnected,
        currentMusicId,
        listeners,
        connect,
        disconnect,
        joinSession,
        leaveSession,
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
