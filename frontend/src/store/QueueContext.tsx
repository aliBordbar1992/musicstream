"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { queue as queueApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

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
  type: 'next' | 'queue';
}

interface Queue {
  id: number;
  name: string;
  items: QueueItem[];
}

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

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchQueue = async () => {
    if (!user) return; // Don't fetch if user is not authenticated

    try {
      setLoading(true);
      try {
        const data = await queueApi.get();
        setQueue(data);
        setError(null);
      } catch (err) {
        // If queue doesn't exist (404), create one
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          const newQueue = await queueApi.create();
          setQueue(newQueue);
          setError(null);
        } else {
          throw err; // Re-throw if it's a different error
        }
      }
    } catch (err) {
      setError('Failed to fetch or create queue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createQueue = async () => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      const data = await queueApi.create();
      setQueue(data);
      setError(null);
    } catch (err) {
      setError('Failed to create queue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToQueue = async (musicId: number) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      await queueApi.addItem(musicId);
      await fetchQueue();
      setError(null);
    } catch (err) {
      setError('Failed to add song to queue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToNext = async (musicId: number) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      await queueApi.addToNext(musicId);
      await fetchQueue();
      setError(null);
    } catch (err) {
      setError('Failed to add song to play next');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromQueue = async (itemId: number) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      await queueApi.removeItem(itemId);
      await fetchQueue();
      setError(null);
    } catch (err) {
      setError('Failed to remove song from queue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQueueItemPosition = async (itemId: number, position: number) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setLoading(true);
      await queueApi.updateItemPosition(itemId, position);
      await fetchQueue();
      setError(null);
    } catch (err) {
      setError('Failed to update queue item position');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQueue();
    } else {
      setQueue(null); // Clear queue when user logs out
    }
  }, [user]); // Only fetch when user changes

  return (
    <QueueContext.Provider
      value={{
        queue,
        loading,
        error,
        createQueue,
        addToQueue,
        addToNext,
        removeFromQueue,
        updateQueueItemPosition,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
} 