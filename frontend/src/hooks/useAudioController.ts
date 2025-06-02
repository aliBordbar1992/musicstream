import { useState, useEffect, useCallback, RefObject } from "react";
import debounce from "lodash/debounce";
import { usePlayer } from "@/store/PlayerContext";

export function useAudioController(audioRef: RefObject<HTMLAudioElement>) {
  const {
    isPlaying,
    currentTrack,
    pause,
    resume,
    seek,
    updateProgress,
    clearTrack,
  } = usePlayer();
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        pause();
      });
      resume();
    }
  }, [audioRef, pause, resume]);

  const handlePause = useCallback(() => {
    if (isPlaying) {
      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      pause();
    }
  }, [audioRef, isPlaying, pause]);

  // Consolidated effect for audio management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set up event listeners
    const handleLoadedMetadata = () => {
      if (isPlaying) {
        handlePlay();
      }
    };

    const handleTimeUpdate = () => {
      updateProgressState(audio);
    };

    const handleEnded = () => {
      handlePause();
      setProgress(0);
      setCurrentTime(0);
    };

    const handleError = (error: Event) => {
      console.error("Audio error:", error);
      const audioElement = error.target as HTMLAudioElement;
      console.error("Audio source:", audioElement.src);
      console.error("Audio error code:", audioElement.error?.code);
      console.error("Audio error message:", audioElement.error?.message);
      handlePause();
    };

    const handleProgress = () => {
      updateProgressState(audio);
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
      // reset audio state if the track URL has changed
      if (audio.src.indexOf(currentTrack.url) === -1) {
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
          handlePause();
          return;
        }

        // Load the new source
        audio.load();
      }
    }

    // Set volume and mute state
    audio.volume = volume / 100;
    audio.muted = isMuted;

    // Handle play/pause state
    if (isPlaying && currentTrack?.url) {
      handlePlay();
    } else {
      handlePause();
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
    volume,
    isMuted,
    updateProgressState,
    handlePlay,
    handlePause,
    pause,
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
  };
}
