import * as Slider from "@radix-ui/react-slider";
import { formatDuration } from "@/utils/formatDuration";

interface ProgressSliderProps {
  duration: number;
  currentTime: number;
  progress: number;
  buffered: number;
  onChange: (value: number) => void;
}

export function ProgressSlider({
  duration,
  currentTime,
  progress,
  buffered,
  onChange,
}: ProgressSliderProps) {
  return (
    <div className="w-full flex items-center space-x-3">
      <span className="text-sm text-neutral-500 dark:text-neutral-400 min-w-[40px]">
        {formatDuration(currentTime)}
      </span>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-6"
        value={[progress]}
        onValueChange={([value]) => onChange(value)}
        max={100}
        step={1}
      >
        <Slider.Track className="bg-neutral-200 dark:bg-neutral-700 relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
          {/* Buffered progress indicator */}
          <div
            className="absolute bg-neutral-300 dark:bg-neutral-600 rounded-full h-full"
            style={{ width: `${buffered}%` }}
          />
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
  );
}
