interface RetroSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RetroSwitch({ label, checked, onChange }: RetroSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {/* Label */}
      <div className="text-xs uppercase tracking-wider text-amber-200/70 font-mono">
        {label}
      </div>

      {/* Switch */}
      <button
        onClick={() => onChange(!checked)}
        className="relative w-14 h-7 rounded-full transition-all"
        style={{
          background: checked
            ? 'linear-gradient(180deg, #ff6b35 0%, #c74a20 100%)'
            : 'linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 100%)',
          boxShadow: checked
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 107, 53, 0.5)'
            : 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
          border: '2px solid rgba(0, 0, 0, 0.3)'
        }}
      >
        <div
          className="absolute top-0.5 bottom-0.5 w-6 rounded-full transition-all duration-200"
          style={{
            left: checked ? 'calc(100% - 26px)' : '2px',
            background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #888)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
          }}
        />

        {/* LED Indicator */}
        {checked && (
          <div
            className="absolute top-1/2 left-2 w-2 h-2 rounded-full"
            style={{
              transform: 'translateY(-50%)',
              backgroundColor: '#fff',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 107, 53, 1)'
            }}
          />
        )}
      </button>
    </div>
  );
}

RetroSwitch.displayName = 'RetroSwitch';
