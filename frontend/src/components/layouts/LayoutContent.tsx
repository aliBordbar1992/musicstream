"use client";

import React from "react";
import Navigation from "@/components/layouts/Navigation";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  //const { isOpen, close } = useQueueSidebar();

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex flex-1 pt-16">
        <main className="flex-1 overflow-y-auto">{children}</main>
        {/* <QueueSidebar isOpen={isOpen} onClose={close} /> */}
      </div>
    </div>
  );
}
