import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Playlist {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface FeaturedPlaylistsProps {
  playlists: Playlist[];
}

export default function FeaturedPlaylists({
  playlists,
}: FeaturedPlaylistsProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Featured Playlists
        </h2>
        <Link
          href="/playlists"
          className="text-primary-600 hover:underline font-medium"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="aspect-square relative">
              <Image
                src={playlist.image}
                alt={playlist.title}
                fill={true}
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
          </motion.div>
        ))}
      </div>
    </section>
  );
}
