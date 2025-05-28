import { useRef, useEffect, useCallback } from "react";
import { WebSocketManager } from "./websocketManager";
import { PlayerEvent } from "./types";
import { useAuth } from "@/store/AuthContext";

export function useWebSocket(wsUrl: string) {
  const managerRef = useRef<WebSocketManager | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    managerRef.current = new WebSocketManager(wsUrl);
    return () => {
      managerRef.current?.disconnect();
    };
  }, [wsUrl]);

  useEffect(() => {
    if (user?.username) {
      managerRef.current?.setUsername(user.username);
    }
  }, [user?.username]);

  const sendEvent = useCallback(async (event: PlayerEvent) => {
    if (managerRef.current) {
      await managerRef.current.sendEvent(event);
    }
  }, []);

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  const getSocketState = useCallback(() => {
    return (
      managerRef.current?.getSocketState() ?? {
        isConnected: false,
        isConnecting: false,
        lastActivity: Date.now(),
      }
    );
  }, []);

  const getSessionState = useCallback(() => {
    return (
      managerRef.current?.getSessionState() ?? {
        sessionId: null,
        musicId: null,
        isActive: false,
      }
    );
  }, []);

  const setMessageHandler = useCallback(
    (handler: (event: MessageEvent) => void) => {
      managerRef.current?.setMessageHandler(handler);
    },
    []
  );

  return {
    sendEvent,
    disconnect,
    getSocketState,
    getSessionState,
    setMessageHandler,
  };
}
