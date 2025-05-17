"use client";

import { motion } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  QueueListIcon,
} from "@heroicons/react/24/solid";

import { formatDuration } from "../utils/formatDuration";
import Image from "next/image";
import { usePlayer } from "@/store/PlayerContext";
import { useQueueSidebar } from "@/store/QueueSidebarContext";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function MusicPlayer() {
  const { currentTrack, isPlaying, setIsPlaying, setCurrentTrack } =
    usePlayer();
  const { toggle: toggleQueue } = useQueueSidebar();

  const [audioState, audioControls] = useAudioPlayer(
    currentTrack,
    isPlaying,
    setIsPlaying,
    () => {
      // Handle track end - you can implement queue logic here
      console.log("Track ended");
    }
  );

  const handleClose = () => {
    audioControls.close();
    setCurrentTrack(null);
  };

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4">
          <Image
            src={currentTrack.image || "/default-cover.png"}
            alt={currentTrack.title}
            width={60}
            height={60}
            className="rounded-md"
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {currentTrack.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="flex items-center justify-center space-x-6 mb-2">
            <button
              onClick={() => audioControls.seek(audioState.currentTime - 10)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <BackwardIcon className="h-6 w-6" />
            </button>

            <button
              onClick={() =>
                isPlaying ? audioControls.pause() : audioControls.play()
              }
              className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400"
            >
              {isPlaying ? (
                <PauseIcon className="h-8 w-8" />
              ) : (
                <PlayIcon className="h-8 w-8" />
              )}
            </button>

            <button
              onClick={() => audioControls.seek(audioState.currentTime + 10)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ForwardIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDuration(audioState.currentTime)}
            </span>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[audioState.progress]}
              onValueChange={([value]) => audioControls.setProgress(value)}
              max={100}
              step={1}
            >
              <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Progress"
              />
            </Slider.Root>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDuration(audioState.duration)}
            </span>
          </div>
        </div>

        {/* Volume and Queue Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => audioControls.setIsMuted(!audioState.isMuted)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {audioState.isMuted ? (
                <SpeakerXMarkIcon className="h-5 w-5" />
              ) : (
                <SpeakerWaveIcon className="h-5 w-5" />
              )}
            </button>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-24 h-5"
              value={[audioState.volume]}
              onValueChange={([value]) => audioControls.setVolume(value)}
              max={100}
              step={1}
            >
              <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Volume"
              />
            </Slider.Root>
          </div>

          <button
            onClick={toggleQueue}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <QueueListIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
