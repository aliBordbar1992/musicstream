// websocketUtils.ts

import Cookies from "js-cookie";
import { API_URL } from "@/lib/api";
import { eventBus } from "@/lib/eventBus";

export function shouldSkipConnection(
  isConnected: boolean,
  isConnecting: boolean
): boolean {
  if (isConnected || isConnecting) {
    console.log("Already connected or connecting, skipping connection attempt");
    return true;
  }
  return false;
}

export function getTokenOrThrow(): string {
  const token = Cookies.get("token");
  if (!token) {
    const error = new Error("No authentication token found");
    emitSessionError(error.message);
    throw error;
  }
  return token;
}

export function setupConnectionTimeout(
  timeoutMs: number,
  onTimeout: () => void
): NodeJS.Timeout {
  return setTimeout(() => {
    onTimeout();
  }, timeoutMs);
}

export function createWebSocket(token: string): WebSocket {
  const wsUrl = API_URL.replace(/^http/, "ws");
  return new WebSocket(`${wsUrl}/ws/listen?token=${token}`);
}

export function cleanupExistingConnection(
  wsRef: React.RefObject<WebSocket | null>,
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | null>
): void {
  if (
    wsRef.current?.readyState === WebSocket.OPEN ||
    wsRef.current?.readyState === WebSocket.CONNECTING
  ) {
    wsRef.current.close();
  }
  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = null;
  }
}

export function scheduleReconnect(
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | null>,
  connectFn: () => Promise<void>,
  delayMs: number = 5000
): void {
  reconnectTimeoutRef.current = setTimeout(() => {
    connectFn().catch(console.error);
  }, delayMs);
}

export function emitSessionError(message: string): void {
  eventBus.emit("session:error", { message });
}

export function handleWebSocketError(
  error: Event | string,
  connectionTimeout: NodeJS.Timeout,
  setIsConnecting: (v: boolean) => void,
  reject: (err: Error) => void
): void {
  console.error("WebSocket error:", error);
  clearTimeout(connectionTimeout);
  setIsConnecting(false);
  const wsError = new Error("WebSocket connection error");
  emitSessionError(wsError.message);
  reject(wsError);
}

export function handleWebSocketClose(
  event: CloseEvent,
  connectionTimeout: NodeJS.Timeout,
  setIsConnected: (v: boolean) => void,
  setIsConnecting: (v: boolean) => void,
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | null>,
  connect: () => Promise<void>,
  reject: (err: Error) => void
): void {
  console.log("WebSocket closed:", event);
  clearTimeout(connectionTimeout);
  setIsConnected(false);
  setIsConnecting(false);
  eventBus.emit("session:disconnected");

  if (event.code !== 1000) {
    scheduleReconnect(reconnectTimeoutRef, connect);
    reject(new Error(`WebSocket closed with code ${event.code}`));
  }
}

export function setupWebSocketMessageHandler(
  ws: WebSocket,
  updateLastActivity: () => void,
  messageHandlerRef: React.RefObject<((e: MessageEvent) => void) | null>
): void {
  ws.onmessage = (event) => {
    updateLastActivity();
    if (messageHandlerRef.current) {
      try {
        messageHandlerRef.current(event);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    }
  };
}

export function setupInactivityInterval(
  checkInactivity: () => void,
  intervalRef: React.RefObject<NodeJS.Timeout | null>,
  intervalMs: number
): void {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
  }
  intervalRef.current = setInterval(checkInactivity, intervalMs);
}

export function handleWebSocketOpen(
  connectionTimeout: NodeJS.Timeout,
  setIsConnected: (v: boolean) => void,
  setIsConnecting: (v: boolean) => void,
  updateLastActivity: () => void,
  inactivityCheckIntervalRef: React.RefObject<NodeJS.Timeout | null>,
  checkInactivity: () => void,
  INACTIVITY_CHECK_INTERVAL: number,
  processMessageQueue: () => Promise<void>,
  resolve: () => void
): void {
  console.log("WebSocket connected");
  clearTimeout(connectionTimeout);
  setIsConnected(true);
  setIsConnecting(false);
  eventBus.emit("session:connected");
  updateLastActivity();

  setupInactivityInterval(
    checkInactivity,
    inactivityCheckIntervalRef,
    INACTIVITY_CHECK_INTERVAL
  );

  processMessageQueue().catch(console.error);
  resolve();
}

export async function connect(
  isConnected: boolean,
  isConnecting: boolean,
  setIsConnected: (v: boolean) => void,
  setIsConnecting: (v: boolean) => void,
  wsRef: React.RefObject<WebSocket | null>,
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | null>,
  messageHandlerRef: React.RefObject<((e: MessageEvent) => void) | null>,
  updateLastActivity: () => void,
  checkInactivity: () => void,
  inactivityCheckIntervalRef: React.RefObject<NodeJS.Timeout | null>,
  INACTIVITY_CHECK_INTERVAL: number,
  processMessageQueue: () => Promise<void>
): Promise<void> {
  console.log("connecting", isConnected, isConnecting);
  return new Promise((resolve, reject) => {
    if (shouldSkipConnection(isConnected, isConnecting)) {
      resolve();
      return;
    }

    setIsConnecting(true);

    try {
      const token = getTokenOrThrow();
      cleanupExistingConnection(wsRef, reconnectTimeoutRef);

      const connectionTimeout = setupConnectionTimeout(10000, () => {
        const error = new Error("WebSocket connection timeout");
        emitSessionError(error.message);
        setIsConnecting(false);
        wsRef.current?.close();
        reject(error);
      });

      const ws = createWebSocket(token);
      wsRef.current = ws;

      ws.onopen = () =>
        handleWebSocketOpen(
          connectionTimeout,
          setIsConnected,
          setIsConnecting,
          updateLastActivity,
          inactivityCheckIntervalRef,
          checkInactivity,
          INACTIVITY_CHECK_INTERVAL,
          processMessageQueue,
          resolve
        );

      ws.onclose = (event) =>
        handleWebSocketClose(
          event,
          connectionTimeout,
          setIsConnected,
          setIsConnecting,
          reconnectTimeoutRef,
          () =>
            connect(
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
            ),
          reject
        );

      ws.onerror = (error) =>
        handleWebSocketError(error, connectionTimeout, setIsConnecting, reject);

      setupWebSocketMessageHandler(ws, updateLastActivity, messageHandlerRef);
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnecting(false);
      const wsError = new Error("Failed to create WebSocket connection");
      emitSessionError(wsError.message);
      reject(wsError);
    }
  });
}
