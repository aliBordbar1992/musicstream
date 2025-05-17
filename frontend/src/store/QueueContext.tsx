"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { queue as queueApi } from "@/lib/api";
import { useAuth } from "@/store/AuthContext";
import axios from "axios";

// Domain types
export interface Music {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  album: string;
  duration: number;
}

export interface QueueItem {
  id: number;
  music: Music;
  position: number;
  type: "next" | "queue";
}

export interface Queue {
  id: number;
  name: string;
  items: QueueItem[];
}

// State types
interface QueueState {
  queue: Queue | null;
  loading: boolean;
  error: string | null;
}

type QueueAction =
  | { type: "SET_QUEUE"; payload: Queue }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_QUEUE" };

// Pure functions for queue operations
const queueReducer = (state: QueueState, action: QueueAction): QueueState => {
  switch (action.type) {
    case "SET_QUEUE":
      return { ...state, queue: action.payload, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_QUEUE":
      return { ...state, queue: null, error: null };
    default:
      return state;
  }
};

// API error handling
const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      return "Queue not found";
    }
    return error.response?.data?.message || "An error occurred";
  }
  return "An unexpected error occurred";
};

// Context type
interface QueueContextType {
  queue: Queue | null;
  loading: boolean;
  error: string | null;
  createQueue: () => Promise<void>;
  addToQueue: (musicId: number) => Promise<void>;
  addToNext: (musicId: number) => Promise<void>;
  removeFromQueue: (itemId: number) => Promise<void>;
  updateQueueItemPosition: (itemId: number, position: number) => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

// Provider component
export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, {
    queue: null,
    loading: false,
    error: null,
  });

  const { user } = useAuth();

  const fetchQueue = useCallback(async () => {
    if (!user) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const data = await queueApi.get();
        dispatch({ type: "SET_QUEUE", payload: data });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          const newQueue = await queueApi.create();
          dispatch({ type: "SET_QUEUE", payload: newQueue });
        } else {
          throw err;
        }
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
      console.error(err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user]);

  const createQueue = useCallback(async () => {
    if (!user) throw new Error("User must be authenticated");

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await queueApi.create();
      dispatch({ type: "SET_QUEUE", payload: data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
      console.error(err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user]);

  const addToQueue = useCallback(
    async (musicId: number) => {
      if (!user) throw new Error("User must be authenticated");

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await queueApi.addItem(musicId);
        await fetchQueue();
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
        console.error(err);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user, fetchQueue]
  );

  const addToNext = useCallback(
    async (musicId: number) => {
      if (!user) throw new Error("User must be authenticated");

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await queueApi.addToNext(musicId);
        await fetchQueue();
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
        console.error(err);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user, fetchQueue]
  );

  const removeFromQueue = useCallback(
    async (itemId: number) => {
      if (!user) throw new Error("User must be authenticated");

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await queueApi.removeItem(itemId);
        await fetchQueue();
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
        console.error(err);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user, fetchQueue]
  );

  const updateQueueItemPosition = useCallback(
    async (itemId: number, position: number) => {
      if (!user) throw new Error("User must be authenticated");

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        await queueApi.updateItemPosition(itemId, position);
        await fetchQueue();
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
        console.error(err);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user, fetchQueue]
  );

  useEffect(() => {
    if (user) {
      fetchQueue();
    } else {
      dispatch({ type: "CLEAR_QUEUE" });
    }
  }, [user, fetchQueue]);

  const value = {
    queue: state.queue,
    loading: state.loading,
    error: state.error,
    createQueue,
    addToQueue,
    addToNext,
    removeFromQueue,
    updateQueueItemPosition,
  };

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
}
