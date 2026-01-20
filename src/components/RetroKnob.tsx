import { useState, useRef, useEffect } from 'react';

/**
 * Props for the RetroKnob component.
 */
interface RetroKnobProps {
  /** Label text displayed above the knob */
  label: string;
  /** Current value of the knob */
  value: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Value change step increment */
  step?: number;
  /** Callback triggered when value changes */
  onChange: (value: number) => void;
  /** Unit suffix to display next to the value (e.g., "px", "%") */
  unit?: string;
  /** Visual size of the knob */
  size?: 'sm' | 'md' | 'lg';
  /** Accent color for the indicator */
  color?: string;
  /** Whether the input is being edited (optional, for external control) */
  isEditing?: boolean;
  /** Callback to set editing state (optional) */
  setIsEditing?: (editing: boolean) => void;
  /** Current input value string (optional) */
  inputValue?: string;
  /** Callback to set input value (optional) */
  setInputValue?: (value: string) => void;
}

/**
 * A retro-styled rotary knob component that supports drag interaction.
 * Rotates from -135deg to +135deg (270deg total).
 */
export function RetroKnob({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  size = 'md',
  color = '#ff6b35',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isEditing: _isEditing,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsEditing: _setIsEditing,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  inputValue: _inputValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setInputValue: _setInputValue,
}: RetroKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const sizeMap = {
    sm: { knob: 60, indicator: 3 },
    md: { knob: 80, indicator: 4 },
    lg: { knob: 100, indicator: 5 },
  };

  const dimensions = sizeMap[size];

  // Normalize value to 0-1 range
  const normalizedValue = (value - min) / (max - min);

  // Convert to rotation angle (-135 to 135 degrees, 270 degree range)
  const rotation = -135 + normalizedValue * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    e.preventDefault();
    knobRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue = value;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      newValue = Math.min(max, value + step);
      e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      newValue = Math.max(min, value - step);
      e.preventDefault();
    } else if (e.key === 'Home') {
      newValue = min;
      e.preventDefault();
    } else if (e.key === 'End') {
      newValue = max;
      e.preventDefault();
    }

    if (newValue !== value) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const sensitivity = range / 200; // 200px movement = full range
      const newValue = Math.max(min, Math.min(max, startValue.current + deltaY * sensitivity));

      // Round to nearest step
      const steppedValue = Math.round(newValue / step) * step;
      onChange(steppedValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, step, onChange]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Knob Label */}
      <div
        className="text-xs uppercase tracking-wider text-amber-200/70 font-mono"
        id={`label-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {label}
      </div>

      {/* Knob Container */}
      <div
        ref={knobRef}
        className="relative outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-full"
        style={{ width: dimensions.knob, height: dimensions.knob }}
        role="slider"
        tabIndex={0}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        aria-valuetext={`${value}${unit}`}
        onKeyDown={handleKeyDown}
      >
        {/* Tick marks */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={dimensions.knob}
          height={dimensions.knob}
          viewBox={`0 0 ${dimensions.knob} ${dimensions.knob}`}
          aria-hidden="true"
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = -135 + i * 27; // 11 ticks across 270 degrees
            const rad = (angle * Math.PI) / 180;
            const innerRadius = dimensions.knob / 2 - 8;
            const outerRadius = dimensions.knob / 2 - 2;
            const x1 = dimensions.knob / 2 + Math.cos(rad) * innerRadius;
            const y1 = dimensions.knob / 2 + Math.sin(rad) * innerRadius;
            const x2 = dimensions.knob / 2 + Math.cos(rad) * outerRadius;
            const y2 = dimensions.knob / 2 + Math.sin(rad) * outerRadius;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fff"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
        </svg>

        {/* Knob background */}
        <div
          className="absolute inset-2 rounded-full cursor-grab active:cursor-grabbing"
          style={{
            background: `radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a)`,
            boxShadow: `
              inset -2px -2px 4px rgba(0, 0, 0, 0.8),
              inset 2px 2px 4px rgba(255, 255, 255, 0.1),
              0 4px 8px rgba(0, 0, 0, 0.5)
            `,
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Knob ridges */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-1/2 w-px h-full bg-white/10"
                style={{
                  transform: `rotate(${i * 15}deg)`,
                  transformOrigin: '50% 50%',
                }}
              />
            ))}
          </div>

          {/* Indicator */}
          <div
            className="absolute top-1/2 left-1/2 transition-transform duration-100"
            style={{
              width: dimensions.knob * 0.6,
              height: dimensions.knob * 0.6,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            <div
              className="absolute top-1 left-1/2 rounded-full"
              style={{
                width: dimensions.indicator,
                height: dimensions.indicator,
                marginLeft: -dimensions.indicator / 2,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}, 0 0 4px ${color}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div
        className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded border border-amber-200/20 text-amber-200 min-w-[60px] text-center"
        aria-hidden="true"
      >
        {typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}
        {unit}
      </div>
    </div>
  );
}

RetroKnob.displayName = 'RetroKnob';
