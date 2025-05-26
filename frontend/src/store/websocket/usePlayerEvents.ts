import { useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import { useSessionState } from "./useSessionState";

export function usePlayerEvents() {
  const { play, leaveSession, pause, resume, seek, progress } =
    useSessionState();

  useEffect(() => {
    // Subscribe to events
    eventBus.on("player:play", play);
    eventBus.on("player:clear", leaveSession);
    eventBus.on("player:pause", pause);
    eventBus.on("player:resume", resume);
    eventBus.on("player:seek", seek);
    eventBus.on("player:progress", progress);

    // Cleanup
    return () => {
      eventBus.off("player:play", play);
      eventBus.off("player:clear", leaveSession);
      eventBus.off("player:pause", pause);
      eventBus.off("player:resume", resume);
      eventBus.off("player:seek", seek);
      eventBus.off("player:progress", progress);
    };
  }, [play, leaveSession, pause, resume, seek, progress]);
}
