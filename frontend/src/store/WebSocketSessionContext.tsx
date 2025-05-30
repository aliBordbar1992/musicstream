"use client";

import React, { createContext, useContext, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import {
  WebSocketMessage,
  WebSocketPayload,
  PlayerEvent,
} from "@/types/domain";
import { useListeners } from "../hooks/useListeners";
import { useWebSocket } from "../hooks/useWebSocket";
import { API_URL } from "@/lib/api";
import Cookies from "js-cookie";
import { useAuth } from "@/store/AuthContext";
import { WebSocketSessionContextType } from "@/types/context";

const WebSocketSessionContext =
  createContext<WebSocketSessionContextType | null>(null);

// Type guards for WebSocket messages
function isUserJoinedMessage(
  message: WebSocketMessage
): message is WebSocketMessage & {
  t: "user_joined";
  p: WebSocketPayload["user_joined"];
} {
  return message.t === "user_joined";
}

function isUserLeftMessage(
  message: WebSocketMessage
): message is WebSocketMessage & {
  t: "user_left";
  p: WebSocketPayload["user_left"];
} {
  return message.t === "user_left";
}

function isProgressMessage(
  message: WebSocketMessage
): message is WebSocketMessage & {
  t: "progress";
  p: WebSocketPayload["progress"];
} {
  return message.t === "progress";
}

function isSeekMessage(
  message: WebSocketMessage
): message is WebSocketMessage & { t: "seek"; p: WebSocketPayload["seek"] } {
  return message.t === "seek";
}

function isPauseMessage(
  message: WebSocketMessage
): message is WebSocketMessage & { t: "pause"; p: WebSocketPayload["pause"] } {
  return message.t === "pause";
}

function isResumeMessage(
  message: WebSocketMessage
): message is WebSocketMessage & {
  t: "resume";
  p: WebSocketPayload["resume"];
} {
  return message.t === "resume";
}

function isCurrentListenersMessage(
  message: WebSocketMessage
): message is WebSocketMessage & {
  t: "current_listeners";
  p: WebSocketPayload["current_listeners"];
} {
  return message.t === "current_listeners";
}

export function WebSocketSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = Cookies.get("token");
  const wsUrl = token ? `${API_URL}/ws/listen?token=${token}` : null;
  const { user } = useAuth();

  const {
    sendEvent,
    disconnect,
    getSocketState,
    getSessionState,
    setMessageHandler,
  } = useWebSocket(wsUrl || "");
  const {
    listeners,
    addListener,
    removeListener,
    updateListenerProgress,
    updateListenerState,
    clearListeners,
  } = useListeners();

  // Handle WebSocket messages
  useEffect(() => {
    if (!wsUrl) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        // Split the message by newlines in case multiple messages are concatenated
        const messages = event.data.split("\n").filter(Boolean);

        for (const message of messages) {
          const data = JSON.parse(message) as WebSocketMessage;

          if (isUserJoinedMessage(data)) {
            addListener(
              data.p.u,
              data.p.n !== null ? data.p.n : data.p.u,
              data.p.pp,
              data.p.p || 0
            );
          } else if (isUserLeftMessage(data)) {
            removeListener(data.p.u);
          } else if (isProgressMessage(data)) {
            updateListenerProgress(data.p.u, data.p.p);
          } else if (isSeekMessage(data)) {
            updateListenerState(data.p.u, "seeking");
            updateListenerProgress(data.p.u, data.p.p);
          } else if (isPauseMessage(data)) {
            updateListenerState(data.p.u, "paused");
          } else if (isResumeMessage(data)) {
            updateListenerState(data.p.u, "playing");
          } else if (isCurrentListenersMessage(data)) {
            data.p.l.forEach((listener) => {
              addListener(
                listener.u,
                listener.n !== null ? listener.n : listener.u,
                listener.pp,
                listener.p || 0
              );
            });

            // remove other listeners not in the list
            listeners.forEach((listener) => {
              if (!data.p.l.some((l) => l.u === listener.username)) {
                removeListener(listener.username);
              }
            });
          }
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error, event);
        eventBus.emit("session:error", {
          message: "Failed to parse WebSocket message",
        });
      }
    };

    // Set up event bus listeners for player events
    const playHandler = (event: PlayerEvent) => {
      // Update local state
      if (event.musicId) {
        addListener(
          user?.username || "",
          user?.name || user?.username || "",
          user?.profile_picture || null,
          event.progress || 0
        );
        updateListenerState(user?.username || "", "playing");
      }
      // Send to server
      sendEvent({
        type: "play",
        musicId: event.musicId,
        timestamp: Date.now(),
      });
    };

    const pauseHandler = (event: PlayerEvent) => {
      // Update local state
      if (event.musicId) {
        updateListenerState(user?.username || "", "paused");
      }
      // Send to server
      sendEvent({
        type: "pause",
        musicId: event.musicId,
        timestamp: Date.now(),
      });
    };

    const resumeHandler = (event: PlayerEvent) => {
      // Update local state
      if (event.musicId) {
        updateListenerState(user?.username || "", "playing");
      }
      // Send to server
      sendEvent({
        type: "resume",
        musicId: event.musicId,
        timestamp: Date.now(),
      });
    };

    const progressHandler = (event: PlayerEvent) => {
      // Update local state
      if (event.musicId && event.progress !== undefined) {
        updateListenerProgress(user?.username || "", event.progress);
      }
      // Send to server
      sendEvent({
        type: "progress",
        musicId: event.musicId,
        progress: event.progress,
        timestamp: Date.now(),
      });
    };

    const closeHandler = (event: PlayerEvent) => {
      // Update local state
      if (event.musicId) {
        clearListeners();
      }
      // Send to server
      sendEvent({
        type: "close",
        musicId: event.musicId,
        timestamp: Date.now(),
      });
    };

    eventBus.on("player:play", playHandler);
    eventBus.on("player:pause", pauseHandler);
    eventBus.on("player:resume", resumeHandler);
    eventBus.on("player:progress", progressHandler);
    eventBus.on("player:close", closeHandler);

    // Set up WebSocket message handler using the manager from useWebSocket
    setMessageHandler(handleMessage);

    return () => {
      eventBus.off("player:play", playHandler);
      eventBus.off("player:pause", pauseHandler);
      eventBus.off("player:resume", resumeHandler);
      eventBus.off("player:progress", progressHandler);
      eventBus.off("player:close", closeHandler);
    };
  }, [
    wsUrl,
    sendEvent,
    addListener,
    removeListener,
    updateListenerProgress,
    setMessageHandler,
    updateListenerState,
  ]);

  const socketState = getSocketState();
  const sessionState = getSessionState();
  const currentMusicId = sessionState.isActive ? sessionState.musicId : null;

  return (
    <WebSocketSessionContext.Provider
      value={{
        isConnected: socketState.isConnected,
        currentMusicId,
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
