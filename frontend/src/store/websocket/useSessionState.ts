import { useState } from "react";
import { Listener, WebSocketMessage } from "./types";
import { EventTypes } from "@/lib/eventBus";

export function useSessionState(
  wsRef: React.RefObject<WebSocket | null>,
  updateLastActivity: () => void,
  sendMessage: (message: WebSocketMessage) => void
) {
  const [currentMusicId, setCurrentMusicId] = useState<number | null>(null);
  const [listeners, setListeners] = useState<Listener[]>([]);

  const handleUserJoined = (data: EventTypes["session:userJoined"]) => {
    setListeners((prev) => [
      ...prev,
      { username: data.username, position: data.position },
    ]);
  };

  const handleUserLeft = (data: EventTypes["session:userLeft"]) => {
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

  const joinSession = (musicId: number, position: number | null) => {
    console.log("Joining session", musicId, position);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      updateLastActivity();
      sendMessage({
        t: "join_session",
        p: { music_id: musicId, position: position },
      });
      setCurrentMusicId(musicId);

      // Request current listeners after joining
      sendMessage({
        t: "get_listeners",
        p: {},
      });
    }
  };

  const leaveSession = () => {
    console.log("Leaving session");
    if (wsRef.current?.readyState === WebSocket.OPEN && currentMusicId) {
      updateLastActivity();
      sendMessage({
        t: "leave_session",
        p: {},
      });
      clearSession();
    }
  };

  return {
    currentMusicId,
    setCurrentMusicId,
    listeners,
    setListeners,
    handleUserJoined,
    handleUserLeft,
    handleProgressUpdate,
    clearSession,
    joinSession,
    leaveSession,
  };
}
