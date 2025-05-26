"use client";

import React, { createContext, useContext, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import { WebSocketSessionContextType } from "./websocket/types";
import { useWebSocketConnection } from "./websocket/useWebSocketConnection";
import { useListenerState, useSessionState } from "./websocket/useSessionState";
import { usePlayerEvents } from "./websocket/usePlayerEvents";

const WebSocketSessionContext =
  createContext<WebSocketSessionContextType | null>(null);

export function WebSocketSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("websocket session provider");
  const {
    isConnected,
    wsRef,
    disconnect,
    updateLastActivity,
    setMessageHandler,
  } = useWebSocketConnection();

  const { seek, currentSession } = useSessionState();

  const { listeners, addListener, removeListener, updateListenerProgress } =
    useListenerState();

  // Set up player events
  usePlayerEvents();

  // Handle WebSocket messages
  useEffect(() => {
    console.log("websocket session provider use effect");
    const musicSessionMessageHandler = (event: MessageEvent) => {
      updateLastActivity();
      try {
        const data = JSON.parse(event.data);
        switch (data.t) {
          case "user_joined":
            addListener(data.p.u, data.p.p || 0);
            break;
          case "user_left":
            removeListener(data.p.u);
            break;
          case "progress":
            updateListenerProgress(data.p.u, data.p.p);
            break;
          case "seek":
            updateListenerProgress(data.p.u, data.p.p);
            break;
          case "pause":
            eventBus.emit("session:pauseUpdate", { username: data.p.u });
            break;
          case "resume":
            eventBus.emit("session:resumeUpdate", { username: data.p.u });
            break;
          case "current_listeners":
            const listeners = data.p.l;
            listeners.forEach(
              (listener: { username: string; position: number }) => {
                addListener(listener.username, listener.position);
              }
            );
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error, event);
        eventBus.emit("session:error", {
          message: "Failed to parse WebSocket message",
        });
      }
    };

    setMessageHandler(musicSessionMessageHandler);

    return () => {
      setMessageHandler(() => {});
    };
  }, [
    wsRef,
    updateLastActivity,
    setMessageHandler,
    addListener,
    removeListener,
    updateListenerProgress,
    seek,
  ]);

  return (
    <WebSocketSessionContext.Provider
      value={{
        isConnected,
        currentMusicId: currentSession === null ? null : currentSession.musicId,
        listeners,
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
