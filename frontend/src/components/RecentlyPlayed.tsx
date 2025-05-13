import { motion } from 'framer-motion';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  image: string;
}

interface RecentlyPlayedProps {
  tracks: Track[];
}

export default function RecentlyPlayed({ tracks }: RecentlyPlayedProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recently Played</h2>
        <a href="/music" className="text-primary-600 hover:underline font-medium">Go to Library</a>
      </div>
      <div className="space-y-4">
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
            className="flex items-center space-x-4 p-4 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={track.image}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                {track.title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {track.artist}
              </p>
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {track.duration}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 