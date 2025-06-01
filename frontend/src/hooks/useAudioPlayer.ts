/* import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { PlayerTrack } from "@/types/domain";
import { music } from "@/lib/api";

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
  const [audioState, setAudioState] = useState<AudioPlayerState>({
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
        setAudioState((prev) => ({ ...prev, isLoading: true }));

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
          setAudioState((prev) => ({ ...prev, isLoading: false }));
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

        // Calculate range for initial chunk
        const chunkSize = 64 * 1024; // 64KB chunk size
        const range = { start: 0, end: chunkSize - 1 };

        const { data: initialChunk, contentRange } = await music.streamChunk(
          url,
          range
        );
        const totalSize = contentRange
          ? parseInt(contentRange.split("/")[1])
          : 0;

        // Create a MediaSource
        const mediaSource = new MediaSource();
        const objectUrl = URL.createObjectURL(mediaSource);
        objectUrlRef.current = objectUrl;

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        // Set up MediaSource event listeners
        mediaSource.addEventListener("sourceopen", async () => {
          try {
            const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

            // Function to load next chunk
            const loadNextChunk = async (start: number) => {
              if (start >= totalSize) return;

              const end = Math.min(start + chunkSize - 1, totalSize - 1);
              const { data: chunk } = await music.streamChunk(url, {
                start,
                end,
              });
              sourceBuffer.appendBuffer(chunk);
            };

            // Load initial chunk
            sourceBuffer.appendBuffer(initialChunk);

            // Set up event listeners for buffering
            sourceBuffer.addEventListener("updateend", () => {
              if (sourceBuffer.updating) return;

              const currentTime = audioRef.current?.currentTime || 0;
              const bufferedEnd = sourceBuffer.buffered.end(
                sourceBuffer.buffered.length - 1
              );

              // If we're close to the end of the buffer, load more
              if (bufferedEnd - currentTime < 10) {
                // 10 seconds threshold
                loadNextChunk(Math.floor(bufferedEnd * 1024)); // Convert to bytes
              }
            });

            // Set audio properties
            if (!audioRef.current) return;

            audioRef.current.src = objectUrl;
            audioRef.current.volume = audioState.volume / 100;
            audioRef.current.muted = audioState.isMuted;

            if (isPlaying) {
              await audioRef.current.play();
            }
          } catch (error) {
            console.error("Error setting up MediaSource:", error);
            onPlayStateChange(false);
          }
        });

        // Set up event listeners
        const handleLoadedMetadata = () => {
          if (audioRef.current && isMounted.current) {
            setAudioState((prev) => ({
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
            setAudioState((prev) => ({
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
      } catch (error) {
        console.error("Error loading audio:", error);
        if (isMounted.current) {
          onPlayStateChange(false);
        }
      } finally {
        isLoading.current = false;
        setAudioState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadAudio();

    return () => {
      isMounted.current = false;
    };
  }, [
    currentTrack?.url,
    currentTrack?.id,
    isPlaying,
    onPlayStateChange,
    audioState.isMuted,
    audioState.volume,
  ]);

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
    audioRef.current.volume = audioState.volume / 100;
    audioRef.current.muted = audioState.isMuted;
  }, [audioState.volume, audioState.isMuted]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      onPlayStateChange(false);
      setAudioState((prev) => ({
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
      setAudioState((prev) => ({ ...prev, volume }));
    },
    setIsMuted: (isMuted: boolean) => {
      setAudioState((prev) => ({ ...prev, isMuted }));
    },
    setProgress: (progress: number) => {
      if (!audioRef.current || isNaN(audioRef.current.duration)) return;
      const newTime = (progress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setAudioState((prev) => ({
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
        setAudioState((prev) => ({
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

  return [audioState, controls];
};
 */
