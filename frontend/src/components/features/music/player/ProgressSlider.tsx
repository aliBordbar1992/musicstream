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
      <span className="slider-time">{formatDuration(currentTime)}</span>
      <Slider.Root
        className="slider-root"
        value={[progress]}
        onValueChange={([value]) => onChange(value)}
        max={100}
        step={1}
      >
        <Slider.Track className="slider-track">
          <Slider.Range className="slider-range" />
          {/* Buffered progress indicator */}
          <div className="slider-buffered" style={{ width: `${buffered}%` }} />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" aria-label="Progress" />
      </Slider.Root>
      <span className="slider-time">{formatDuration(duration)}</span>
    </div>
  );
}
