"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/layouts/Navigation";
import FeaturedPlaylists from "@/components/features/playlist/FeaturedPlaylists";
import RecentlyPlayed from "@/components/features/music/RecentlyPlayed";
import { LayoutContent } from "@/components/layouts/LayoutContent";
import { QueueProvider } from "@/store/QueueContext";

const featuredPlaylists = [
  {
    id: 1,
    title: "Top Hits 2024",
    description: "The hottest tracks of 2024",
    image: "https://placehold.co/600x400/png",
  },
  {
    id: 2,
    title: "Chill Vibes",
    description: "Relaxing tunes for your day",
    image: "https://placehold.co/600x400/png",
  },
  {
    id: 3,
    title: "Workout Mix",
    description: "High-energy tracks to keep you moving",
    image: "https://placehold.co/600x400/png",
  },
];

export default function Home() {
  return (
    <LayoutContent>
      <QueueProvider>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
          <Navigation />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-24">
            {/* Hero Section */}
            <section className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-90" />
                <div className="relative px-8 py-16 md:py-24">
                  <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4">
                    Your Music, Your Way
                  </h1>
                  <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-200 max-w-2xl">
                    Discover, stream, and share your favorite music with our
                    modern streaming platform.
                  </p>
                </div>
              </motion.div>
            </section>

            <FeaturedPlaylists playlists={featuredPlaylists} />
            <RecentlyPlayed />
          </main>
        </div>
      </QueueProvider>
    </LayoutContent>
  );
}
