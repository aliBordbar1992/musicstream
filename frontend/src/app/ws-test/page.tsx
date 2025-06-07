"use client";

import React from "react";
import { MusicList } from "@/features/music/components/MusicList";
import { music } from "@/lib/api";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { useWebSocketSession } from "@/store/WebSocketSessionContext";
import Button from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import UserImage from "@/components/ui/UserImage";
import { Chat } from "@/components/features/chat/Chat";

export default function WebSocketTestPage() {
  const { isConnected, currentMusicId, listeners, disconnect } =
    useWebSocketSession();

  const { data: musicList, isLoading } = useQuery({
    queryKey: ["music"],
    queryFn: () => music.getAll(),
  });

  return (
    <LayoutContent>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">WebSocket Test Page</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Music List</h2>
            <MusicList music={musicList || []} loading={isLoading} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Session Panel</h2>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 h-96 flex flex-col">
              <div className="text-sm text-neutral-500 mb-4">
                Status: {isConnected ? "Connected" : "Disconnected"}
                {currentMusicId && ` (Music ID: ${currentMusicId})`}
              </div>
              <Button onClick={disconnect}>Disconnect</Button>
              {listeners.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">
                    Current Listeners:
                  </div>
                  <div className="space-y-2">
                    {listeners.map((listener) => (
                      <div
                        key={listener.username}
                        className="text-sm p-2 rounded bg-neutral-100 dark:bg-neutral-700"
                      >
                        <div className="flex items-center space-x-3">
                          <UserImage
                            src={listener.profile_picture}
                            alt={listener.name || listener.username}
                            size="sm"
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              {listener.name || listener.username}
                            </div>
                            <div className="text-xs text-neutral-500">
                              Position: {listener.position.toFixed(0)}s
                            </div>
                            <div className="text-xs text-neutral-500">
                              State: {listener.state}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Chat</h2>
            <div className="h-96">
              <Chat currentMusicId={currentMusicId} />
            </div>
          </div>
        </div>
      </div>
    </LayoutContent>
  );
}
