import { useCallback, useMemo } from "react";
import { useQueue } from "@/store/QueueContext";
import { DragEndEvent } from "@dnd-kit/core";
import { useAudioPlayer } from "./useAudioPlayer";
import { usePlayer } from "@/store/PlayerContext";
import { Queue, QueueItem } from "@/types/domain";

// Pure functions for queue operations
const findItemIndex = (items: QueueItem[], itemId: number): number =>
  items.findIndex((item) => item.id === itemId);

const isValidDragOperation = (
  active: { id: string | number },
  over: { id: string | number } | null,
  queue: Queue | null
): boolean => {
  if (!over || !queue) return false;
  const oldIndex = findItemIndex(queue.items, Number(active.id));
  const newIndex = findItemIndex(queue.items, Number(over.id));
  return oldIndex !== newIndex;
};

// Hook state and controls types
export interface QueueManagementState {
  queue: Queue | null;
  loading: boolean;
  error: string | null;
}

export interface QueueManagementControls {
  createQueue: (name: string) => Promise<void>;
  updateQueueItemPosition: (itemId: number, newIndex: number) => Promise<void>;
  removeFromQueue: (itemId: number) => Promise<void>;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  playItem: (itemId: number) => Promise<void>;
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

  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } =
    usePlayer();

  // Initialize audio player
  useAudioPlayer(currentTrack, isPlaying, setIsPlaying, () => {
    // Handle track end
    const currentIndex = queue?.items.findIndex(
      (item) => item.music.id === currentTrack?.id
    );
    if (
      currentIndex !== undefined &&
      currentIndex < (queue?.items.length ?? 0) - 1
    ) {
      const nextItem = queue?.items[currentIndex + 1];
      if (nextItem) {
        setCurrentTrack({
          id: nextItem.music.id,
          title: nextItem.music.title,
          artist: nextItem.music.artistName,
          duration: nextItem.music.duration,
          url: `/api/music/${nextItem.music.id}/stream`,
        });
        setIsPlaying(true);
      }
    }
  });

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!isValidDragOperation(active, over, queue)) return;

      try {
        await updateQueueItemPosition(Number(active.id), Number(over!.id));
      } catch (err) {
        console.error("Failed to update queue item position:", err);
        throw new Error("Failed to update queue item position");
      }
    },
    [queue, updateQueueItemPosition]
  );

  const playItem = useCallback(
    async (itemId: number) => {
      if (!queue) return;

      const item = queue.items.find((item) => item.id === itemId);
      if (!item) {
        throw new Error("Item not found in queue");
      }

      try {
        setCurrentTrack({
          id: item.music.id,
          title: item.music.title,
          artist: item.music.artist.name,
          duration: item.music.duration,
          url: `/api/music/${item.music.id}/stream`,
          position: 0,
        });
        setIsPlaying(true);
      } catch (err) {
        console.error("Failed to play item:", err);
        throw new Error("Failed to play item");
      }
    },
    [queue, setCurrentTrack, setIsPlaying]
  );

  const state = useMemo(
    () => ({
      queue,
      loading,
      error,
    }),
    [queue, loading, error]
  );

  const controls = useMemo(
    () => ({
      createQueue,
      updateQueueItemPosition,
      removeFromQueue,
      handleDragEnd,
      playItem,
    }),
    [
      createQueue,
      updateQueueItemPosition,
      removeFromQueue,
      handleDragEnd,
      playItem,
    ]
  );

  return [state, controls];
};
