'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import MusicPlayer from '@/components/MusicPlayer';
import FeaturedPlaylists from '@/components/FeaturedPlaylists';
import RecentlyPlayed from '@/components/RecentlyPlayed';

const featuredPlaylists = [
  {
    id: 1,
    title: 'Chill Vibes',
    description: 'Relaxing beats for your day',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
  },
  {
    id: 2,
    title: 'Workout Mix',
    description: 'High energy tracks to keep you moving',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=500&fit=crop',
  },
  {
    id: 3,
    title: 'Focus Flow',
    description: 'Concentration enhancing melodies',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop',
  },
];

const recentlyPlayed = [
  {
    id: 1,
    title: 'Midnight Dreams',
    artist: 'Luna Echo',
    duration: '3:45',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
  },
  {
    id: 2,
    title: 'Summer Breeze',
    artist: 'Coastal Waves',
    duration: '4:20',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&h=500&fit=crop',
  },
  {
    id: 3,
    title: 'Urban Nights',
    artist: 'City Lights',
    duration: '3:15',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
  },
];

export default function Home() {
  return (
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
                Discover, stream, and share your favorite music with our modern
                streaming platform.
              </p>
            </div>
          </motion.div>
        </section>

        <FeaturedPlaylists playlists={featuredPlaylists} />
        <RecentlyPlayed tracks={recentlyPlayed} />
      </main>

      <MusicPlayer />
    </div>
  );
}
