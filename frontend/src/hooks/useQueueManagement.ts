import { useCallback } from "react";
import { useQueue } from "@/store/QueueContext";
import { DragEndEvent } from "@dnd-kit/core";

interface Music {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  album: string;
  duration: number;
}

interface QueueItem {
  id: number;
  music: Music;
  position: number;
  type: "next" | "queue";
}

interface Queue {
  id: number;
  name: string;
  items: QueueItem[];
}

interface QueueManagementState {
  queue: Queue | null;
  loading: boolean;
  error: string | null;
}

interface QueueManagementControls {
  createQueue: () => Promise<void>;
  updateQueueItemPosition: (itemId: number, newIndex: number) => Promise<void>;
  removeFromQueue: (itemId: number) => Promise<void>;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  playItem: (itemId: number) => void;
}

export const useQueueManagement = (): [
  QueueManagementState,
  QueueManagementControls
] => {
  const {
    queue,
    loading,
    error,
    createQueue,
    updateQueueItemPosition,
    removeFromQueue,
  } = useQueue();

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || !queue) return;

      const oldIndex = queue.items.findIndex((item) => item.id === active.id);
      const newIndex = queue.items.findIndex((item) => item.id === over.id);

      if (oldIndex !== newIndex) {
        await updateQueueItemPosition(Number(active.id), newIndex);
      }
    },
    [queue, updateQueueItemPosition]
  );

  const playItem = useCallback((itemId: number) => {
    // TODO: Implement play functionality
    console.log("Play song:", itemId);
  }, []);

  const state: QueueManagementState = {
    queue,
    loading,
    error,
  };

  const controls: QueueManagementControls = {
    createQueue,
    updateQueueItemPosition,
    removeFromQueue,
    handleDragEnd,
    playItem,
  };

  return [state, controls];
};
