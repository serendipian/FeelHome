'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface EditableCellProps {
  value: number;
  onSave: (value: number) => void;
  format?: (v: number) => string;
  className?: string;
  style?: React.CSSProperties;
  isPercent?: boolean;
  step?: number;
}

export default function EditableCell({
  value,
  onSave,
  format,
  className = '',
  style,
  isPercent,
  step,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleClick = () => {
    setDraft(isPercent ? String(+(value * 100).toFixed(2)) : String(value));
    setEditing(true);
  };

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      onSave(isPercent ? parsed / 100 : parsed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        step={step ?? (isPercent ? 0.1 : 1)}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full rounded px-2 py-1 text-right font-mono text-[12px] outline-none transition-colors"
        style={{
          minWidth: 60,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
          border: '1px solid rgba(212,168,83,0.4)',
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.85)',
        }}
      />
    );
  }

  const displayValue = format ? format(value) : String(value);

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer rounded px-1.5 py-0.5 -mx-1.5 transition-all hover:bg-[#d4a853]/10 hover:text-[#d4a853] ${className}`}
      style={style}
      title="Click to edit"
    >
      {displayValue}
    </span>
  );
}
