"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { playlists } from "@/lib/api";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import Image from "next/image";
interface Playlist {
  id: number;
  title: string;
  description: string;
  image: string;
}

export default function PlaylistsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: playlistsList = [], isLoading } = useQuery<Playlist[]>({
    queryKey: ["playlists"],
    queryFn: () => playlists.getAll(),
  });

  const filteredPlaylists = playlistsList.filter((playlist) =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutContent>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Playlists</h1>
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {isLoading ? (
          <div>Loading...</div>
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
                <a href={`/playlists/${playlist.id}`}>
                  <div className="aspect-square relative">
                    <Image
                      src={playlist.image}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {playlist.title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {playlist.description}
                    </p>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </LayoutContent>
  );
}
