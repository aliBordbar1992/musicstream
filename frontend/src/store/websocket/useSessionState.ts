import { useState } from "react";
import { Listener, WebSocketMessage } from "./types";
import { EventTypes } from "@/lib/eventBus";
import { eventBus } from "@/lib/eventBus";

export function useSessionState(
  wsRef: React.RefObject<WebSocket | null>,
  updateLastActivity: () => void,
  sendMessage: (message: WebSocketMessage) => Promise<void>,
  connect: () => Promise<void>
) {
  const [currentMusicId, setCurrentMusicId] = useState<number | null>(null);
  const [listeners, setListeners] = useState<Listener[]>([]);

  const handleUserJoined = (data: EventTypes["session:userJoined"]) => {
    console.log("User joined", data);
    console.log("Listeners before", listeners);
    setListeners((prev) => [
      ...prev,
      { username: data.username, position: data.position },
    ]);
    console.log("Listeners after", listeners);
  };

  const handleUserLeft = (data: EventTypes["session:userLeft"]) => {
    console.log("User left", data);
    setListeners((prev) => prev.filter((l) => l.username !== data.username));
  };

  const handleProgressUpdate = (data: EventTypes["session:progressUpdate"]) => {
    setListeners((prev) =>
      prev.map((l) =>
        l.username === data.username ? { ...l, position: data.position } : l
      )
    );
  };

  const clearSession = () => {
    setCurrentMusicId(null);
    setListeners([]);
  };

  const joinSession = async (musicId: number, position: number | null) => {
    console.log("Joining session", musicId, position);
    try {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        console.log("WebSocket not open, connecting...");
        await connect();
      }

      updateLastActivity();
      await sendMessage({
        t: "join_session",
        p: { music_id: musicId, position: position },
      });
      setCurrentMusicId(musicId);
      clearSession();

      // Request current listeners after joining
      await sendMessage({
        t: "get_listeners",
        p: {},
      });
    } catch (error) {
      console.error("Failed to join session:", error);
      eventBus.emit("session:error", {
        message: "Failed to join session",
      });
    }
  };

  const leaveSession = async () => {
    console.log("Leaving session");
    if (wsRef.current?.readyState === WebSocket.OPEN && currentMusicId) {
      updateLastActivity();
      try {
        await sendMessage({
          t: "leave_session",
          p: {},
        });
        clearSession();
      } catch (error) {
        console.error("Failed to leave session:", error);
        eventBus.emit("session:error", {
          message: "Failed to leave session",
        });
      }
    }
  };

  return {
    currentMusicId,
    listeners,
    setListeners,
    handleUserJoined,
    handleUserLeft,
    handleProgressUpdate,

    joinSession,
    leaveSession,
  };
}
