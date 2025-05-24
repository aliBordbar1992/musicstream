import { useEffect, useRef } from "react";
import { PlayerTrack } from "@/types/domain";
import { eventBus } from "@/lib/eventBus";
import { WebSocketMessage } from "./types";

export function usePlayerEvents(
  wsRef: React.RefObject<WebSocket | null>,
  isConnected: boolean,
  currentMusicId: number | null,
  updateLastActivity: () => void,
  connect: () => void,
  joinSession: (musicId: number, position: number | null) => void,
  leaveSession: () => void,
  sendMessage: (message: WebSocketMessage) => void
) {
  const lastProgressUpdateRef = useRef<number>(0);
  const isConnectedRef = useRef(isConnected);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    const handlePlay = (track: PlayerTrack) => {
      console.log("handlePlay", track);
      if (!isConnectedRef.current) {
        connect();
        const checkConnection = setInterval(() => {
          if (isConnectedRef.current) {
            clearInterval(checkConnection);
            console.log("Connected, joining session");
            joinSession(track.id, track.position);
          }
        }, 100);
        setTimeout(() => clearInterval(checkConnection), 5000);
      } else {
        console.log("Already connected, joining session");
        joinSession(track.id, track.position);
      }
    };

    const handleClear = () => {
      leaveSession();
    };

    const handlePause = () => {
      console.log("Sending pause event");
      sendMessage({
        t: "pause",
        p: {},
      });
    };

    const handleResume = () => {
      console.log("Sending resume event");
      sendMessage({
        t: "resume",
        p: {},
      });
    };

    const handleSeek = (position: number) => {
      console.log("Sending seek event");
      sendMessage({
        t: "seek",
        p: { p: position },
      });
    };

    const handleProgress = (position: number) => {
      const now = Date.now();
      if (now - lastProgressUpdateRef.current >= 1000) {
        // Only send if 1 second has passed
        sendMessage({
          t: "progress",
          p: { p: position },
        });
        lastProgressUpdateRef.current = now;
      }
    };

    // Subscribe to events
    eventBus.on("player:play", handlePlay);
    eventBus.on("player:clear", handleClear);
    eventBus.on("player:pause", handlePause);
    eventBus.on("player:resume", handleResume);
    eventBus.on("player:seek", handleSeek);
    eventBus.on("player:progress", handleProgress);

    // Cleanup
    return () => {
      eventBus.off("player:play", handlePlay);
      eventBus.off("player:clear", handleClear);
      eventBus.off("player:pause", handlePause);
      eventBus.off("player:resume", handleResume);
      eventBus.off("player:seek", handleSeek);
      eventBus.off("player:progress", handleProgress);
    };
  }, [
    isConnected,
    currentMusicId,
    connect,
    joinSession,
    leaveSession,
    wsRef,
    updateLastActivity,
    sendMessage,
  ]);
}
