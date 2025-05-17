"use client";

import { useState, useEffect, useRef } from "react";
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

import Cookies from "js-cookie";
import { formatDuration } from "../utils/formatDuration";
import Image from "next/image";
import { usePlayer } from "@/store/PlayerContext";
import { useQueueSidebar } from "@/store/QueueSidebarContext";
export default function MusicPlayer() {
  const { currentTrack, isPlaying, setIsPlaying, setCurrentTrack } =
    usePlayer();
  const { toggle: toggleQueue } = useQueueSidebar();
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isInitialLoad = useRef(true);
  const hasLoadedAudio = useRef(false);
  const currentTrackId = useRef<number | null>(null);
  const isMounted = useRef(true);
  const isLoading = useRef(false);

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  // Load audio when track changes
  useEffect(() => {
    isMounted.current = true;

    if (!currentTrack?.url) return;

    const loadAudio = async () => {
      // Prevent concurrent loads
      if (isLoading.current) return;

      try {
        isLoading.current = true;

        // If we already have an object URL for this track and audio is loaded, don't fetch again
        if (
          objectUrlRef.current &&
          audioRef.current?.src === objectUrlRef.current &&
          audioRef.current?.readyState !== undefined &&
          audioRef.current.readyState >= 2 && // HAVE_CURRENT_DATA
          currentTrackId.current === currentTrack.id
        ) {
          // If the audio is already loaded but not playing and isPlaying is true, start playing
          if (!audioRef.current.paused && !isPlaying) {
            audioRef.current.pause();
          } else if (audioRef.current.paused && isPlaying) {
            await audioRef.current.play();
          }
          isLoading.current = false;
          return;
        }

        // If we've already loaded this track, don't fetch again
        if (
          hasLoadedAudio.current &&
          currentTrackId.current === currentTrack.id &&
          audioRef.current?.readyState !== undefined &&
          audioRef.current?.readyState >= 2
        ) {
          isLoading.current = false;
          return;
        }

        // Clean up previous object URL if it exists
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }

        // Fetch the audio with proper headers
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const url = currentTrack.url;
        if (!url) {
          throw new Error("No audio URL found");
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Create a blob from the response
        const blob = await response.blob();

        // Create an object URL from the blob
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        // Initialize or update audio element
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        // Set up event listeners before setting the source
        audioRef.current.addEventListener("loadedmetadata", () => {
          if (audioRef.current && isMounted.current) {
            setDuration(audioRef.current.duration);
            if (isInitialLoad.current) {
              isInitialLoad.current = false;
              if (isPlaying) {
                audioRef.current.play().catch((error) => {
                  console.error("Error playing audio:", error);
                  setIsPlaying(false);
                });
              }
            }
            hasLoadedAudio.current = true;
            currentTrackId.current = currentTrack.id;
          }
        });

        audioRef.current.addEventListener("timeupdate", () => {
          if (audioRef.current && isMounted.current) {
            const newTime = audioRef.current.currentTime;
            const newProgress = (newTime / audioRef.current.duration) * 100;
            setCurrentTime(newTime);
            setProgress(newProgress);
          }
        });

        // Set the source and other properties
        audioRef.current.src = objectUrl;
        audioRef.current.volume = volume / 100;
        audioRef.current.muted = isMuted;

        if (isPlaying) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.error("Error loading audio:", error);
        if (isMounted.current) {
          setIsPlaying(false);
        }
      } finally {
        isLoading.current = false;
      }
    };

    loadAudio();

    return () => {
      isMounted.current = false;
    };
  }, [currentTrack?.url]); // Only reload when track URL changes

  // Handle play/pause state separately
  useEffect(() => {
    if (!audioRef.current || !currentTrack?.url) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack?.url]);

  // Clean up audio resources when component is unmounted
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      hasLoadedAudio.current = false;
      currentTrackId.current = null;
      isMounted.current = false;
    };
  }, []); // Empty dependency array means this runs only on unmount

  // Handle volume and mute changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleError = (error: Event) => {
      console.error("Audio error:", error);
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [isPlaying, setIsPlaying]);

  const handleProgressChange = (value: number) => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const newTime = (value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(value);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number) => {
    console.log("Volume changed:", value);
    setVolume(value);
    setIsMuted(value === 0);
  };

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6"
    >
      {/* Close button inside the player, top-right corner */}
      <button
        onClick={handleClose}
        className="absolute top-negative-1 right-4 z-20 p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full shadow transition-colors bg-white dark:bg-neutral-800"
        aria-label="Close player"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      <div className="w-full">
        <div className="flex flex-col gap-4">
          {/* Progress bar - Now at the top */}
          <div className="w-full flex items-center space-x-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 min-w-[40px]">
              {formatDuration(currentTime)}
            </span>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-6"
              value={[progress]}
              onValueChange={([value]) => handleProgressChange(value)}
              max={100}
              step={1}
            >
              <Slider.Track className="bg-neutral-200 dark:bg-neutral-700 relative grow rounded-full h-1.5">
                <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-4 h-4 bg-white dark:bg-neutral-100 shadow-lg rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Progress"
              />
            </Slider.Root>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 min-w-[40px]">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Controls and info row */}
          <div className="flex items-center">
            {/* Song info */}
            <div className="flex items-center space-x-6 min-w-[200px] w-[25%]">
              <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-md overflow-hidden flex-shrink-0">
                {currentTrack.image && (
                  <Image
                    src={currentTrack.image}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-900 dark:text-white">
                  {currentTrack.title}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {currentTrack.artist}
                </span>
              </div>
            </div>

            {/* Playback controls */}
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
                onClick={() => setIsPlaying(!isPlaying)}
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

            {/* Volume and queue controls */}
            <div className="flex items-center space-x-4 min-w-[200px] w-[25%] justify-end">
              <button
                onClick={toggleQueue}
                className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                aria-label="Toggle queue"
              >
                <QueueListIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="h-6 w-6" />
                ) : (
                  <SpeakerWaveIcon className="h-6 w-6" />
                )}
              </button>
              <div className="w-24">
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-6"
                  value={[isMuted ? 0 : volume]}
                  onValueChange={([value]) => handleVolumeChange(value)}
                  max={100}
                  step={1}
                >
                  <Slider.Track className="bg-neutral-200 dark:bg-neutral-700 relative grow rounded-full h-1.5">
                    <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-4 h-4 bg-white dark:bg-neutral-100 shadow-lg rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Volume"
                  />
                </Slider.Root>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
