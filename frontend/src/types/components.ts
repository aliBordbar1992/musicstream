import { Music } from "./domain";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { InputHTMLAttributes } from "react";

// Song item types
export interface Song extends Music {
  duration: number;
}

export interface SongItemProps extends Song {
  onPlay?: () => void;
  onAddToQueue?: () => void;
}

// Sortable song item types
export interface SortableSong extends Song {
  index: number;
}

export interface SortableSongItemProps extends SortableSong {
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
}

// Artist search types
export interface Artist {
  id: number;
  name: string;
  image?: string;
}

export interface ArtistSearchProps {
  onSelect: (artist: Artist) => void;
}

// Input component types
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Queue sidebar types
export interface QueueSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
