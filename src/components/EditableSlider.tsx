import { useState } from 'react';
import { Slider } from './ui/slider';
import { Input } from './ui/input';

interface EditableSliderProps {
  id: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  className?: string;
  suffix?: string;
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
  suffix = ''
}: EditableSliderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleValueClick = () => {
    if (!disabled) {
      setIsEditing(true);
      setInputValue(value.toString());
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, min), max);
      onValueChange(clampedValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value.toString());
    }
  };

  return (
    <div className={className}>
      <Slider
        id={id}
        value={[value]}
        onValueChange={(values) => onValueChange(values[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}