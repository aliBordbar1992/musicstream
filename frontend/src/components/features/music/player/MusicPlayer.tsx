"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  QueueListIcon,
} from "@heroicons/react/24/solid";
import { useAudioController } from "@/hooks/useAudioController";
import { TrackInfo } from "./TrackInfo";
import { ProgressSlider } from "./ProgressSlider";
import { VolumeSlider } from "./VolumeSlider";
import { MusicControls } from "./MusicControls";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null!);

  const {
    currentTrack,
    currentTime,
    progress,
    buffered,
    volume,
    isMuted,
    isPlaying,
    clearTrack,
    handleProgressChange,
    handleVolumeChange,
    toggleMute,
    handlePause,
    handlePlay,
  } = useAudioController(audioRef);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    clearTrack();
  };

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
        className="player-button-close"
        aria-label="Close player"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      <div className="w-full flex flex-col gap-4">
        <ProgressSlider
          duration={currentTrack.duration}
          currentTime={currentTime}
          progress={progress}
          buffered={buffered}
          onChange={handleProgressChange}
        />

        <div className="flex items-center">
          <TrackInfo track={currentTrack} />
          <MusicControls
            isPlaying={isPlaying}
            togglePlayPause={isPlaying ? handlePause : handlePlay}
          />

          <div className="flex items-center space-x-4 min-w-[200px] w-[25%] justify-end">
            <button
              //onClick={toggleQueue}
              className="player-button"
              aria-label="Toggle queue"
            >
              <QueueListIcon className="h-6 w-6" />
            </button>
            <button
              onClick={toggleMute}
              className="player-button"
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
