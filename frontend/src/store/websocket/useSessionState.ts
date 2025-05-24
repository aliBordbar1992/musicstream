import { useState } from "react";
import { Listener } from "./types";
import { EventTypes } from "@/lib/eventBus";

export function useSessionState() {
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

  return {
    currentMusicId,
    setCurrentMusicId,
    listeners,
    setListeners,
    handleUserJoined,
    handleUserLeft,
    handleProgressUpdate,
    clearSession,
  };
}
