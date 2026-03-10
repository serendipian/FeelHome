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
      className="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        backgroundColor: checked ? color : '#2a2d35',
        boxShadow: checked ? `0 0 12px ${color}40` : 'none',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}
