import { ChevronDown } from 'lucide-react';

interface RetroSelectorProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function RetroSelector({ label, value, options, onChange }: RetroSelectorProps) {
  const currentIndex = options.findIndex(opt => opt.value === value);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    onChange(options[newIndex].value);
  };

  const handleNext = () => {
    const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    onChange(options[newIndex].value);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <div className="text-xs uppercase tracking-wider text-amber-200/70 font-mono">
        {label}
      </div>

      {/* Selector */}
      <div className="relative">
        {/* Channel display */}
        <div
          className="bg-black/60 border-2 border-amber-900/50 rounded px-3 py-2 text-center"
          style={{
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div className="text-amber-200 text-sm font-mono uppercase tracking-wide">
            {options.find(opt => opt.value === value)?.label || value}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handlePrevious}
            className="flex-1 bg-gradient-to-b from-zinc-700 to-zinc-900 border border-zinc-600 rounded px-3 py-1.5 text-xs text-white font-mono uppercase hover:from-zinc-600 hover:to-zinc-800 active:from-zinc-900 active:to-zinc-900 transition-all shadow-md"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
            aria-label={`Previous ${label}`}
          >
            ◄
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-b from-zinc-700 to-zinc-900 border border-zinc-600 rounded px-3 py-1.5 text-xs text-white font-mono uppercase hover:from-zinc-600 hover:to-zinc-800 active:from-zinc-900 active:to-zinc-900 transition-all shadow-md"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
            aria-label={`Next ${label}`}
          >
            ►
          </button>
        </div>
      </div>
    </div>
  );
}
