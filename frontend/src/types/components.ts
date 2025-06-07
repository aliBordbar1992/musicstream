import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { InputHTMLAttributes } from "react";
import { Music, Playlist } from "@/types/domain";

export interface EmptyStateProps {
  searchQuery: string;
  onCreateClick: () => void;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface FileUploadFormProps {
  onSuccess?: () => void;
}

export interface LinkUploadFormProps {
  onSuccess?: () => void;
}

export interface AddToPlaylistProps {
  songId: number;
  onSuccess?: () => void;
}

export interface FeaturedPlaylistsProps {
  playlists: Playlist[];
}

export interface PlaylistSongsProps {
  playlistId: number;
  onUpdate?: () => void;
}

export interface QueueSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Component props
export interface SortableSongItemProps extends SortableSong {
  onPlay: (song: SortableSong) => void;
  onRemove: (id: number) => void;
  className?: string;
}

// Types for drag handle props
export interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}

export interface ArtistSearchProps {
  value: string;
  onChange: (value: string) => void;
  onArtistSelect?: (artist: Artist) => void;
  error?: string;
  required?: boolean;
}

export interface MusicSearchProps {
  value: string;
  onChange: (value: string) => void;
  onMusicSelect?: (music: Music) => void;
  error?: string;
  required?: boolean;
  excludeIds?: number[]; // IDs to exclude from search results
}
/* 
export interface SongItemProps {
  song: Music;
  onPlay?: () => void;
  onAddToQueue?: () => void;
}
 */
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
