"use client";

import React from "react";
import MusicPlayer from "@/components/features/music/MusicPlayer";
import Navigation from "@/components/layouts/Navigation";
import { QueueSidebar } from "@/components/features/queue/QueueSidebar";
import { useQueueSidebar } from "@/store/QueueSidebarContext";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useQueueSidebar();

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div
        className="flex w-full"
        style={{ height: "calc(100vh - 4rem - 5rem)" }}
      >
        <main className="flex-1 h-full">{children}</main>
        <QueueSidebar isOpen={isOpen} onClose={close} />
      </div>
      <MusicPlayer />
    </div>
  );
}
