'use client';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  color: string;
}

export default function Toggle({ checked, onChange, color }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className="relative w-10 h-[22px] rounded-full transition-all duration-400 focus:outline-none shrink-0"
      style={{
        backgroundColor: checked ? color : 'rgba(255,255,255,0.06)',
        boxShadow: checked ? `0 0 16px ${color}30, inset 0 1px 2px rgba(0,0,0,0.2)` : 'inset 0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full shadow-lg transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
          background: checked ? '#fff' : 'rgba(255,255,255,0.3)',
          boxShadow: checked ? `0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px ${color}20` : '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}
