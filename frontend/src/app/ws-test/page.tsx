"use client";

import React, { useState, useEffect } from "react";
import { MusicList } from "@/components/features/music/MusicList";
import { music } from "@/lib/api";
import { Music, PlayerTrack } from "@/types/domain";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { useWebSocketSession } from "@/store/WebSocketSessionContext";
import { eventBus, EventTypes } from "@/lib/eventBus";
import type { Handler } from "mitt";

interface SessionEvent {
  type: string;
  data: unknown;
  timestamp: number;
}

export default function WebSocketTestPage() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([]);
  const { isConnected, currentMusicId, listeners, connect } =
    useWebSocketSession();

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const data = await music.getAll();
        setMusicList(data);
      } catch (error) {
        console.error("Failed to fetch music:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, []);

  // Listen to all session events
  useEffect(() => {
    const addEvent = (type: string, data: unknown) => {
      setSessionEvents((prev) => [
        ...prev,
        {
          type,
          data,
          timestamp: Date.now(),
        },
      ]);
    };

    const handlers = {
      "session:userJoined": (data: EventTypes["session:userJoined"]) =>
        addEvent("User Joined", data),
      "session:userLeft": (data: EventTypes["session:userLeft"]) =>
        addEvent("User Left", data),
      /*       "session:progressUpdate": (data: EventTypes["session:progressUpdate"]) =>
        addEvent("Progress Update", data), */
      "session:seekUpdate": (data: EventTypes["session:seekUpdate"]) =>
        addEvent("Seek Update", data),
      "session:pauseUpdate": (data: EventTypes["session:pauseUpdate"]) =>
        addEvent("Pause Update", data),
      "session:resumeUpdate": (data: EventTypes["session:resumeUpdate"]) =>
        addEvent("Resume Update", data),
      "session:error": (data: EventTypes["session:error"]) =>
        addEvent("Error", data),
      "session:connected": () => addEvent("Connected", null),
      "session:disconnected": () => addEvent("Disconnected", null),
    };

    // Subscribe to all events
    Object.entries(handlers).forEach(([event, handler]) => {
      eventBus.on(
        event as keyof EventTypes,
        handler as Handler<EventTypes[keyof EventTypes]>
      );
    });

    return () => {
      // Unsubscribe from all events
      Object.entries(handlers).forEach(([event, handler]) => {
        eventBus.off(
          event as keyof EventTypes,
          handler as Handler<EventTypes[keyof EventTypes]>
        );
      });
    };
  }, []);

  // Listen to player events to connect to WebSocket session
  useEffect(() => {
    const handlePlay = (track: PlayerTrack) => {
      connect(track.id);
    };

    eventBus.on("player:play", handlePlay);

    return () => {
      eventBus.off("player:play", handlePlay);
    };
  }, [connect]);

  return (
    <LayoutContent>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">WebSocket Test Page</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Music List</h2>
            <MusicList music={musicList} loading={loading} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Session Panel (Chat-like)
            </h2>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto border-b border-neutral-200 dark:border-neutral-700 mb-4 p-2">
                {sessionEvents.length === 0 ? (
                  <div className="text-neutral-400 text-center mt-12">
                    No session events yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessionEvents.map((event, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 rounded bg-neutral-100 dark:bg-neutral-700"
                      >
                        <div className="font-medium">{event.type}</div>
                        {event.data !== null && (
                          <pre className="text-xs mt-1">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        )}
                        <div className="text-xs text-neutral-500 mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-sm text-neutral-500">
                Status: {isConnected ? "Connected" : "Disconnected"}
                {currentMusicId && ` (Music ID: ${currentMusicId})`}
              </div>
              {listeners.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">
                    Current Listeners:
                  </div>
                  <div className="space-y-1">
                    {listeners.map((listener) => (
                      <div
                        key={listener.username}
                        className="text-sm p-1 rounded bg-neutral-100 dark:bg-neutral-700"
                      >
                        {listener.username} - {listener.position.toFixed(1)}s
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutContent>
  );
}
