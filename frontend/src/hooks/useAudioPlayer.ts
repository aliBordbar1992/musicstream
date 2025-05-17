import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { PlayerTrack } from "@/store/PlayerContext";

interface AudioPlayerState {
  volume: number;
  isMuted: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  isLoading: boolean;
}

interface AudioPlayerControls {
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  setProgress: (progress: number) => void;
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  close: () => void;
}

export const useAudioPlayer = (
  currentTrack: PlayerTrack | null,
  isPlaying: boolean,
  onPlayStateChange: (isPlaying: boolean) => void,
  onTrackEnd: () => void
): [AudioPlayerState, AudioPlayerControls] => {
  const [state, setState] = useState<AudioPlayerState>({
    volume: 80,
    isMuted: false,
    progress: 0,
    duration: 0,
    currentTime: 0,
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isInitialLoad = useRef(true);
  const hasLoadedAudio = useRef(false);
  const currentTrackId = useRef<number | null>(null);
  const isMounted = useRef(true);
  const isLoading = useRef(false);

  // Cleanup function
  const cleanup = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    hasLoadedAudio.current = false;
    currentTrackId.current = null;
    isMounted.current = false;
  };

  // Load audio when track changes
  useEffect(() => {
    isMounted.current = true;

    if (!currentTrack?.url) return;

    const loadAudio = async () => {
      if (isLoading.current) return;

      try {
        isLoading.current = true;
        setState((prev) => ({ ...prev, isLoading: true }));

        // Check if audio is already loaded
        if (
          objectUrlRef.current &&
          audioRef.current?.src === objectUrlRef.current &&
          audioRef.current?.readyState !== undefined &&
          audioRef.current.readyState >= 2 &&
          currentTrackId.current === currentTrack.id
        ) {
          if (!audioRef.current.paused && !isPlaying) {
            audioRef.current.pause();
          } else if (audioRef.current.paused && isPlaying) {
            await audioRef.current.play();
          }
          isLoading.current = false;
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Clean up previous audio
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }

        // Fetch audio
        const token = Cookies.get("token");
        if (!token) throw new Error("No authentication token found");

        const url = currentTrack.url;
        if (!url) throw new Error("No audio URL found");

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        // Set up event listeners
        const handleLoadedMetadata = () => {
          if (audioRef.current && isMounted.current) {
            setState((prev) => ({
              ...prev,
              duration: audioRef.current!.duration,
            }));
            if (isInitialLoad.current) {
              isInitialLoad.current = false;
              if (isPlaying) {
                audioRef.current!.play().catch((error) => {
                  console.error("Error playing audio:", error);
                  onPlayStateChange(false);
                });
              }
            }
            hasLoadedAudio.current = true;
            currentTrackId.current = currentTrack.id;
          }
        };

        const handleTimeUpdate = () => {
          if (audioRef.current && isMounted.current) {
            const newTime = audioRef.current.currentTime;
            const newProgress = (newTime / audioRef.current.duration) * 100;
            setState((prev) => ({
              ...prev,
              currentTime: newTime,
              progress: newProgress,
            }));
          }
        };

        audioRef.current.addEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        audioRef.current.addEventListener("timeupdate", handleTimeUpdate);

        // Set audio properties
        audioRef.current.src = objectUrl;
        audioRef.current.volume = state.volume / 100;
        audioRef.current.muted = state.isMuted;

        if (isPlaying) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.error("Error loading audio:", error);
        if (isMounted.current) {
          onPlayStateChange(false);
        }
      } finally {
        isLoading.current = false;
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadAudio();

    return () => {
      isMounted.current = false;
    };
  }, [currentTrack?.url, isPlaying, onPlayStateChange]);

  // Handle play/pause state
  useEffect(() => {
    if (!audioRef.current || !currentTrack?.url) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        onPlayStateChange(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack?.url, onPlayStateChange]);

  // Handle volume and mute changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = state.volume / 100;
    audioRef.current.muted = state.isMuted;
  }, [state.volume, state.isMuted]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      onPlayStateChange(false);
      setState((prev) => ({
        ...prev,
        progress: 0,
        currentTime: 0,
      }));
      onTrackEnd();
    };

    const handleError = (error: Event) => {
      console.error("Audio error:", error);
      onPlayStateChange(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onPlayStateChange, onTrackEnd]);

  const controls: AudioPlayerControls = {
    setVolume: (volume: number) => {
      setState((prev) => ({ ...prev, volume }));
    },
    setIsMuted: (isMuted: boolean) => {
      setState((prev) => ({ ...prev, isMuted }));
    },
    setProgress: (progress: number) => {
      if (!audioRef.current || isNaN(audioRef.current.duration)) return;
      const newTime = (progress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setState((prev) => ({
        ...prev,
        progress,
        currentTime: newTime,
      }));
    },
    play: async () => {
      if (audioRef.current) {
        await audioRef.current.play();
        onPlayStateChange(true);
      }
    },
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        onPlayStateChange(false);
      }
    },
    seek: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setState((prev) => ({
          ...prev,
          currentTime: time,
          progress: (time / audioRef.current!.duration) * 100,
        }));
      }
    },
    close: () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onPlayStateChange(false);
      cleanup();
    },
  };

  return [state, controls];
};
