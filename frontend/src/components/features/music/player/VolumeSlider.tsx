import * as Slider from "@radix-ui/react-slider";

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  return (
    <div className="w-24">
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-6"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
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
  );
}
