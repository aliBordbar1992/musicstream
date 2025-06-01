"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
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
import { usePlayer } from "@/store/PlayerContext";
import { useAudioController } from "@/hooks/useAudioController";
import { TrackInfo } from "./TrackInfo";
import { ProgressSlider } from "./ProgressSlider";
import { VolumeSlider } from "./VolumeSlider";

export default function MusicPlayer() {
  const { currentTrack, isPlaying, clearTrack, pause, resume } = usePlayer();

  const audioRef = useRef<HTMLAudioElement>(null!);

  const {
    duration,
    currentTime,
    progress,
    buffered,
    handleProgressChange,
    handleVolumeChange,
    volume,
    isMuted,
    toggleMute,
  } = useAudioController(audioRef, currentTrack, isPlaying);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    clearTrack();
  };

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pause();
    else resume();
  }, [isPlaying, pause, resume]);

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6"
    >
      <audio ref={audioRef} preload="metadata" hidden />
      <button
        onClick={handleClose}
        className="absolute top-negative-1 right-4 z-20 p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full shadow transition-colors bg-white dark:bg-neutral-800"
        aria-label="Close player"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      <div className="w-full flex flex-col gap-4">
        <ProgressSlider
          duration={duration}
          currentTime={currentTime}
          progress={progress}
          buffered={buffered}
          onChange={handleProgressChange}
        />

        <div className="flex items-center">
          <TrackInfo track={currentTrack} />

          <div className="flex items-center justify-center space-x-4 flex-1">
            <button
              onClick={() => {
                // TODO: Implement previous track
              }}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              aria-label="Previous track"
            >
              <BackwardIcon className="h-6 w-6" />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-3 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className="h-8 w-8" />
              ) : (
                <PlayIcon className="h-8 w-8" />
              )}
            </button>
            <button
              onClick={() => {
                // TODO: Implement next track
              }}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              aria-label="Next track"
            >
              <ForwardIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center space-x-4 min-w-[200px] w-[25%] justify-end">
            <button
              //onClick={toggleQueue}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              aria-label="Toggle queue"
            >
              <QueueListIcon className="h-6 w-6" />
            </button>
            <button
              onClick={toggleMute}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-6 w-6" />
              ) : (
                <SpeakerWaveIcon className="h-6 w-6" />
              )}
            </button>
            <VolumeSlider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
