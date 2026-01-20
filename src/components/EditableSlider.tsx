import { Slider } from './ui/slider';

interface EditableSliderProps {
  id: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  className?: string;
}

export function EditableSlider({
  id,
  value,
  onValueChange,
  min,
  max,
  step,
  disabled = false,
  className = '',
}: EditableSliderProps) {
  return (
    <div className={className}>
      <Slider
        id={id}
        value={[value]}
        onValueChange={(values: number[]) => onValueChange(values[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}
