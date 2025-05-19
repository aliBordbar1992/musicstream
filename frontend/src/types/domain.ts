// Music domain types
export interface Music {
  id: number;
  title: string;
  artistName: string;
  artist: Artist;
  duration: number;
  url: string;
  image?: string;
}

export interface Artist {
  id: number;
  name: string;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  image?: string;
  played_at?: string;
}

// Queue domain types
export interface QueueItem {
  id: number;
  music: Music;
  type: "next" | "queue";
  position: number;
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

// Playlist domain types
export interface Playlist {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string; // ISO date string
  songs?: Music[]; // Optional since it's omitted in some cases
  is_owner: boolean;
}
