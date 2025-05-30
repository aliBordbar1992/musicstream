import { useState } from "react";
import { Listener, ListenerState } from "@/types/domain";

export function useListeners() {
  const [listeners, setListeners] = useState<Listener[]>([]);

  const addListener = (
    username: string,
    name: string,
    profilePicture: string | null,
    position: number
  ) => {
    if (listeners.find((l) => l.username === username)) {
      return;
    }

    const listener: Listener = {
      username,
      name,
      profile_picture: profilePicture,
      position,
      state: "playing",
    };

    setListeners((prev) => [...prev, listener]);
  };

  const removeListener = (username: string) => {
    setListeners((prev) => prev.filter((l) => l.username !== username));
  };

  const updateListenerProgress = (username: string, position: number) => {
    setListeners((prev) =>
      prev.map((l) => (l.username === username ? { ...l, position } : l))
    );
  };

  const updateListenerState = (username: string, state: ListenerState) => {
    // update if the state is different
    if (listeners.find((l) => l.username === username)?.state !== state) {
      setListeners((prev) =>
        prev.map((l) => (l.username === username ? { ...l, state } : l))
      );
    }
  };

  const clearListeners = () => {
    setListeners([]);
  };

  return {
    listeners,
    addListener,
    removeListener,
    updateListenerProgress,
    updateListenerState,
    clearListeners,
  };
}
