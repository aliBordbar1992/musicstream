import { createContext, useContext, useReducer, ReactNode } from "react";
import { queue as queueApi } from "@/lib/api";
import { handleApiError } from "@/utils/error";
import {
  Queue,
  QueueItem,
  QueueState,
  QueueAction,
  QueueContextType,
} from "@/types";
import axios from "axios";

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const initialState: QueueState = {
  queue: null,
  loading: false,
  error: null,
};

function queueReducer(state: QueueState, action: QueueAction): QueueState {
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
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  const fetchQueue = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await queueApi.get();
      dispatch({ type: "SET_QUEUE", payload: data });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        const newQueue = await queueApi.create();
        dispatch({ type: "SET_QUEUE", payload: newQueue });
      } else {
        dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createQueue = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await queueApi.create();
      dispatch({ type: "SET_QUEUE", payload: data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addToQueue = async (musicId: number, type: "next" | "queue") => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      if (type === "next") {
        await queueApi.addToNext(musicId);
      } else {
        await queueApi.addItem(musicId);
      }
      await fetchQueue();
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const removeFromQueue = async (itemId: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await queueApi.removeItem(itemId);
      await fetchQueue();
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearQueue = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await queueApi.updateItemPosition(0, 0); // This is a hack to clear the queue
      dispatch({ type: "CLEAR_QUEUE" });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleApiError(err) });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const value: QueueContextType = {
    queue: state.queue,
    loading: state.loading,
    error: state.error,
    createQueue,
    getQueue: fetchQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
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
