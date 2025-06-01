import { useState, useEffect, useCallback, RefObject } from "react";
import debounce from "lodash/debounce";
import { usePlayer } from "@/store/PlayerContext";
import { PlayerTrack } from "@/types/domain";

export function useAudioController(
  audioRef: RefObject<HTMLAudioElement>,
  currentTrack: PlayerTrack | null,
  isPlaying: boolean
) {
  const { pause, resume, seek, updateProgress } = usePlayer();
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);

  const updateProgressState = useCallback(
    (audio: HTMLAudioElement) => {
      const newTime = audio.currentTime;
      const newProgress = audio.duration
        ? (audio.currentTime / audio.duration) * 100
        : 0;

      setCurrentTime(newTime);
      updateProgress(newTime);
      setProgress(newProgress);

      // Update buffered progress
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const bufferedProgress = audio.duration
          ? (bufferedEnd / audio.duration) * 100
          : 0;
        setBuffered(bufferedProgress);
      }
    },
    [updateProgress]
  );

  // Consolidated effect for audio management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          pause();
        });
      }
    };

    const handleTimeUpdate = () => {
      updateProgressState(audio);
    };

    const handleEnded = () => {
      pause();
      setProgress(0);
      setCurrentTime(0);
    };

    const handleError = (error: Event) => {
      console.error("Audio error:", error);
      const audioElement = error.target as HTMLAudioElement;
      console.error("Audio source:", audioElement.src);
      console.error("Audio error code:", audioElement.error?.code);
      console.error("Audio error message:", audioElement.error?.message);
      pause();
    };

    const handleProgress = () => {
      updateProgressState(audio);
    };

    const handlePlay = () => {
      if (!isPlaying) {
        resume();
      }
    };

    const handlePause = () => {
      if (isPlaying) {
        pause();
      }
    };

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("progress", handleProgress);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Update audio properties
    if (currentTrack?.url) {
      // Reset audio state before loading new source
      audio.pause();
      audio.currentTime = 0;

      // Ensure the URL is properly encoded and includes necessary headers
      try {
        const url = new URL(currentTrack.url);
        // Add cache-busting parameter to prevent caching issues
        url.searchParams.set("t", Date.now().toString());
        audio.src = url.toString();

        // Set necessary audio properties
        audio.preload = "metadata";
        audio.crossOrigin = "anonymous"; // Enable CORS if needed
      } catch {
        console.error("Invalid audio URL:", currentTrack.url);
        pause();
        return;
      }

      // Load the new source
      audio.load();
    }

    // Set volume and mute state
    audio.volume = volume / 100;
    audio.muted = isMuted;

    // Handle play/pause state
    if (isPlaying && currentTrack?.url) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        pause();
      });
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("progress", handleProgress);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [
    audioRef,
    currentTrack?.url,
    isPlaying,
    pause,
    resume,
    updateProgressState,
    volume,
    isMuted,
  ]);

  const debouncedSeek = debounce((value: number) => {
    const audio = audioRef.current;
    if (!audio || isNaN(audio.duration)) return;
    const newTime = (value / 100) * audio.duration;
    audio.currentTime = newTime;
    seek(newTime);
  }, 100);

  const handleProgressChange = useCallback(
    (value: number) => {
      setProgress(value);
      debouncedSeek(value);
    },
    [debouncedSeek]
  );

  const debouncedVolumeChange = debounce((value: number) => {
    setVolume(value);
    setIsMuted(value === 0);
  }, 100);

  const handleVolumeChange = useCallback(
    (value: number) => {
      debouncedVolumeChange(value);
    },
    [debouncedVolumeChange]
  );

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  return {
    duration,
    currentTime,
    progress,
    buffered,
    handleProgressChange,
    handleVolumeChange,
    volume,
    isMuted,
    toggleMute,
  };
}
