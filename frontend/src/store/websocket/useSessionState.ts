import { useState, useEffect, useRef } from "react";
import { Listener } from "./types";
import { eventBus } from "@/lib/eventBus";
import { PlayerTrack } from "@/types/domain";
import { useWebSocketConnection } from "./useWebSocketConnection";

export function useListenerState() {
  const [listeners, setListeners] = useState<Listener[]>([]);

  const addListener = (username: string, position: number) => {
    // check if listener already exists
    if (listeners.find((l) => l.username === username)) {
      return;
    }

    setListeners((prev) => [...prev, { username, position }]);
  };

  const removeListener = (username: string) => {
    setListeners((prev) => prev.filter((l) => l.username !== username));
  };

  const updateListenerProgress = (username: string, position: number) => {
    setListeners((prev) =>
      prev.map((l) => (l.username === username ? { ...l, position } : l))
    );
  };

  return { listeners, addListener, removeListener, updateListenerProgress };
}

export function useSessionState() {
  const { isConnected, sendMessage, updateLastActivity } =
    useWebSocketConnection();
  const [joinSessionRequest, setJoinSessionRequest] = useState<{
    musicId: number;
    position: number | null;
  } | null>(null);
  const [currentSession, setCurrentSession] = useState<{
    musicId: number;
    position: number | null;
  } | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);

  // Handle WebSocket connection status changes and join session
  useEffect(() => {
    if (!isConnected || !joinSessionRequest) {
      console.log(
        "not connected or no join session request",
        isConnected,
        joinSessionRequest
      );
      return;
    }

    const joinSession = async () => {
      console.log(
        "joining session for music",
        joinSessionRequest.musicId,
        "at position",
        joinSessionRequest.position
      );
      try {
        await sendMessage(
          JSON.stringify({
            t: "join_session",
            p: {
              music_id: joinSessionRequest.musicId,
              position: joinSessionRequest.position,
            },
          })
        );

        // Request current listeners after joining
        await sendMessage(
          JSON.stringify({
            t: "get_listeners",
            p: {},
          })
        );

        setCurrentSession({
          musicId: joinSessionRequest.musicId,
          position: joinSessionRequest.position,
        });
        setJoinSessionRequest(null);
      } catch (error) {
        console.error("Failed to join session:", error);
        eventBus.emit("session:error", {
          message: "Failed to join session",
        });
      }
    };

    joinSession();
  }, [isConnected, joinSessionRequest, sendMessage]);

  const leaveSession = async () => {
    console.log("leaving session...", currentSession?.musicId);
    try {
      if (isConnected) {
        await sendMessage(
          JSON.stringify({
            t: "leave_session",
            p: {},
          })
        );
      }

      setCurrentSession(null);
    } catch (error) {
      console.error("Failed to leave session:", error);
      eventBus.emit("session:error", {
        message: "Failed to leave session",
      });
    }
  };

  const guardSession = () => {
    if (!currentSession || !isConnected) {
      throw new Error("Not in a music session.");
    }
  };

  const play = async (track: PlayerTrack) => {
    console.log("playing track", track);
    if (currentSession?.musicId !== track.id) {
      console.log("setting join session request", track.id, track.position);
      setJoinSessionRequest({ musicId: track.id, position: track.position });
    }
  };

  const pause = async () => {
    console.log("pausing");
    guardSession();

    await sendMessage(
      JSON.stringify({
        t: "pause",
        p: {},
      })
    );
    updateLastActivity();
  };

  const resume = async () => {
    console.log("resuming");
    guardSession();

    await sendMessage(
      JSON.stringify({
        t: "resume",
        p: {},
      })
    );
    updateLastActivity();
  };

  const seek = async (position: number) => {
    console.log("seeking to", position);
    guardSession();
    await sendMessage(
      JSON.stringify({
        t: "seek",
        p: { p: position },
      })
    );
    updateLastActivity();
  };

  const progress = async (position: number) => {
    guardSession();

    const now = Date.now();
    if (now - lastProgressUpdateRef.current >= 1000) {
      // Only send if 1 second has passed
      await sendMessage(
        JSON.stringify({
          t: "progress",
          p: { p: position },
        })
      );
      lastProgressUpdateRef.current = now;
    }
    updateLastActivity();
  };

  return {
    currentSession,
    play,
    pause,
    resume,
    seek,
    progress,
    leaveSession,
  };
}
