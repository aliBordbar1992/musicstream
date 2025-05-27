// websocketUtils.ts

import Cookies from "js-cookie";
import { API_URL } from "@/lib/api";
import { eventBus } from "@/lib/eventBus";
import { ConnectionManager } from "./connectionState";

export function shouldSkipConnection(manager: ConnectionManager): boolean {
  if (manager.state.isConnected || manager.state.isConnecting) {
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

export function cleanupExistingConnection(manager: ConnectionManager): void {
  if (
    manager.refs.ws.current?.readyState === WebSocket.OPEN ||
    manager.refs.ws.current?.readyState === WebSocket.CONNECTING
  ) {
    manager.refs.ws.current.close();
  }
  if (manager.refs.reconnectTimeout.current) {
    clearTimeout(manager.refs.reconnectTimeout.current);
    manager.refs.reconnectTimeout.current = null;
  }
}

export function scheduleReconnect(
  manager: ConnectionManager,
  connectFn: () => Promise<void>,
  delayMs: number = 5000
): void {
  manager.refs.reconnectTimeout.current = setTimeout(() => {
    connectFn().catch(console.error);
  }, delayMs);
}

export function emitSessionError(message: string): void {
  eventBus.emit("session:error", { message });
}

export function handleWebSocketError(
  error: Event | string,
  connectionTimeout: NodeJS.Timeout,
  manager: ConnectionManager,
  reject: (err: Error) => void
): void {
  console.error("WebSocket error:", error);
  clearTimeout(connectionTimeout);
  manager.dispatch({ type: "ERROR" });
  const wsError = new Error("WebSocket connection error");
  emitSessionError(wsError.message);
  reject(wsError);
}

export function handleWebSocketClose(
  event: CloseEvent,
  connectionTimeout: NodeJS.Timeout,
  manager: ConnectionManager,
  connect: () => Promise<void>,
  reject: (err: Error) => void
): void {
  console.log("WebSocket closed:", event);
  clearTimeout(connectionTimeout);
  manager.dispatch({ type: "DISCONNECTED" });
  eventBus.emit("session:disconnected");

  if (event.code !== 1000) {
    scheduleReconnect(manager, connect);
    reject(new Error(`WebSocket closed with code ${event.code}`));
  }
}

export function setupWebSocketMessageHandler(
  ws: WebSocket,
  manager: ConnectionManager
): void {
  ws.onmessage = (event) => {
    manager.dispatch({ type: "ACTIVITY_UPDATE" });
    if (manager.refs.messageHandler.current) {
      try {
        manager.refs.messageHandler.current(event);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    }
  };
}

export function setupInactivityInterval(
  checkInactivity: () => void,
  manager: ConnectionManager,
  intervalMs: number
): void {
  if (manager.refs.inactivityCheckInterval.current) {
    clearInterval(manager.refs.inactivityCheckInterval.current);
  }
  manager.refs.inactivityCheckInterval.current = setInterval(
    checkInactivity,
    intervalMs
  );
}

export function handleWebSocketOpen(
  connectionTimeout: NodeJS.Timeout,
  manager: ConnectionManager,
  checkInactivity: () => void,
  INACTIVITY_CHECK_INTERVAL: number,
  processMessageQueue: () => Promise<void>,
  resolve: () => void
): void {
  console.log("WebSocket connected");
  clearTimeout(connectionTimeout);

  // First update activity to ensure we have a valid timestamp
  manager.dispatch({ type: "ACTIVITY_UPDATE" });

  // Then mark as connected
  manager.dispatch({ type: "CONNECTED" });

  // Emit connected event after state is updated
  eventBus.emit("session:connected");

  // Setup inactivity check
  setupInactivityInterval(checkInactivity, manager, INACTIVITY_CHECK_INTERVAL);

  // Process any queued messages
  processMessageQueue().catch(console.error);

  // Resolve the connection promise
  resolve();
}

export async function connect(manager: ConnectionManager): Promise<void> {
  console.log("connect called", manager.state);
  return new Promise((resolve, reject) => {
    if (shouldSkipConnection(manager)) {
      console.log("shouldSkipConnection true, resolve");
      resolve();
      return;
    }

    console.log("shouldSkipConnection false, try to connect");
    try {
      const token = getTokenOrThrow();
      cleanupExistingConnection(manager);

      const connectionTimeout = setupConnectionTimeout(10000, () => {
        const error = new Error("WebSocket connection timeout");
        emitSessionError(error.message);
        manager.dispatch({ type: "ERROR" });
        manager.refs.ws.current?.close();
        reject(error);
      });

      const ws = createWebSocket(token);
      manager.refs.ws.current = ws;

      ws.onopen = () =>
        handleWebSocketOpen(
          connectionTimeout,
          manager,
          () => {
            const now = Date.now();
            if (now - manager.state.lastActivity >= 30000) {
              console.log(
                "Inactivity timeout reached, disconnecting WebSocket"
              );
              if (manager.refs.ws.current) {
                manager.refs.ws.current.close(1000, "Inactivity timeout");
              }
            }
          },
          5000,
          async () => {
            if (manager.refs.ws.current?.readyState === WebSocket.OPEN) {
              // Process any queued messages
              return Promise.resolve();
            }
            return Promise.resolve();
          },
          resolve
        );

      ws.onclose = (event) =>
        handleWebSocketClose(
          event,
          connectionTimeout,
          manager,
          () => connect(manager),
          reject
        );

      ws.onerror = (error) =>
        handleWebSocketError(error, connectionTimeout, manager, reject);

      setupWebSocketMessageHandler(ws, manager);
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      manager.dispatch({ type: "ERROR" });
      const wsError = new Error("Failed to create WebSocket connection");
      emitSessionError(wsError.message);
      reject(wsError);
    }
  });
}
