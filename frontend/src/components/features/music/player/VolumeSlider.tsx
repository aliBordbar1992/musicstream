import * as Slider from "@radix-ui/react-slider";

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  return (
    <div className="w-24">
      <Slider.Root
        className="slider-root"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        max={100}
        step={1}
      >
        <Slider.Track className="slider-track">
          <Slider.Range className="slider-range" />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" aria-label="Volume" />
      </Slider.Root>
    </div>
  );
}
