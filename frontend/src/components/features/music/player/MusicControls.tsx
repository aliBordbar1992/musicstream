import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
} from "@heroicons/react/24/solid";

interface MusicControlsProps {
  togglePlayPause: () => void;
  isPlaying: boolean;
}

export function MusicControls({
  togglePlayPause,
  isPlaying,
}: MusicControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4 flex-1">
      <button
        onClick={() => {
          // TODO: Implement previous track
        }}
        className="player-button"
        aria-label="Previous track"
      >
        <BackwardIcon className="h-6 w-6" />
      </button>
      <button
        onClick={togglePlayPause}
        className="player-button-play"
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
        className="player-button"
        aria-label="Next track"
      >
        <ForwardIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
