// Music domain types
export interface Music {
  id: number;
  title: string;
  artist: string;
  duration: number;
  url: string;
  image?: string;
}

// Queue domain types
export interface QueueItem {
  id: number;
  music: Music;
  type: "next" | "queue";
}

export interface Queue {
  id: number;
  name: string;
  items: QueueItem[];
}

// Player domain types
export interface PlayerTrack {
  id: number;
  title: string;
  artist: string;
  duration: number;
  image?: string;
  url?: string;
}

// User domain types
export interface User {
  id: string;
  email: string;
  name: string;
}
