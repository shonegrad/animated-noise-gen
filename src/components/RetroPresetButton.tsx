interface RetroPresetButtonProps {
  label: string;
  onClick: () => void;
}

export function RetroPresetButton({ label, onClick }: RetroPresetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative px-3 py-2 rounded text-xs font-mono uppercase tracking-wide transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
        boxShadow: `
          0 2px 4px rgba(0, 0, 0, 0.5),
          inset 0 1px 1px rgba(255, 255, 255, 0.15),
          inset 0 -1px 1px rgba(0, 0, 0, 0.4)
        `,
        border: '1px solid rgba(0, 0, 0, 0.4)',
        color: '#ffd700',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
      }}
    >
      {label}
    </button>
  );
}
