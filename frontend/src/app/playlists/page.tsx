"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlists } from "@/lib/api";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import Image from "next/image";
import Link from "next/link";
import { MusicalNoteIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Playlist } from "@/types/domain";
import Button from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";

const EmptyState = ({ searchQuery, onCreateClick }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-4 mb-4">
      <MusicalNoteIcon className="h-12 w-12 text-neutral-400" />
    </div>
    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
      No Playlists Found
    </h3>
    <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mb-6">
      {searchQuery
        ? "No playlists match your search. Try different keywords."
        : "You haven't created any playlists yet. Start by creating your first playlist!"}
    </p>
    <button
      onClick={onCreateClick}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Create Playlist
    </button>
  </div>
);

export default function PlaylistsPage() {
  console.log("Component rendered");

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const queryClient = useQueryClient();

  const { data: playlistsList = [], isLoading } = useQuery<Playlist[]>({
    queryKey: ["playlists"],
    queryFn: () => {
      console.log("Fetching playlists...");
      return playlists.getAll();
    },
  });

  console.log("Playlists data:", playlistsList);

  const createPlaylistMutation = useMutation({
    mutationFn: (name: string) => playlists.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setIsCreateModalOpen(false);
      setNewPlaylistName("");
    },
  });

  const filteredPlaylists = playlistsList.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylistMutation.mutate(newPlaylistName.trim());
    }
  };

  return (
    <LayoutContent>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Playlists</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full"
            >
              Create Playlist
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Loading className="h-64" />
        ) : filteredPlaylists.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map((playlist) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href={`/playlists/${playlist.id}`}>
                  <div className="aspect-square relative">
                    <Image
                      src="https://placehold.co/600x400/png"
                      alt={playlist.name}
                      fill={true}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {playlist.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Playlist Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                Create New Playlist
              </h2>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlaylist}
                  isLoading={createPlaylistMutation.isPending}
                >
                  {createPlaylistMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutContent>
  );
}
