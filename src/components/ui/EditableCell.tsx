'use client';

import { useState, useRef, useEffect } from 'react';

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
        className="w-full bg-white/[0.06] border border-[#d4a853]/40 rounded px-2 py-1 text-right font-mono text-[12px] text-white/90 outline-none focus:border-[#d4a853] transition-colors"
        style={{ minWidth: 60 }}
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
