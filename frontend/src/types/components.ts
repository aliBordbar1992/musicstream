import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { InputHTMLAttributes } from "react";
import { Music } from "./domain";

export interface SongItemProps {
  song: Music;
  onPlay?: () => void;
  onAddToQueue?: () => void;
}

// Sortable song item types
export interface SortableSong extends Music {
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
