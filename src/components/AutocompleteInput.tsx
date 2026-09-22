import { useEffect, useRef, useState } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  newOptionLabel: (query: string) => string;
}

export default function AutocompleteInput({ value, onChange, options, placeholder, newOptionLabel }: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const query = value.trim().toLowerCase();
  const filtered = query ? options.filter((o) => o.toLowerCase().includes(query)) : options;
  const showAddOption = query.length > 0 && !options.some((o) => o.toLowerCase() === query);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        className="field-input"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.currentTarget.blur();
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (filtered.length > 0 || showAddOption) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            borderRadius: 14,
            boxShadow: '0 8px 24px oklch(20% 0.02 340 / 0.2)',
            zIndex: 5,
            maxHeight: 200,
            overflowY: 'auto',
            padding: 6,
          }}
        >
          {filtered.map((o) => (
            <div
              key={o}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(o);
                setOpen(false);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {o}
            </div>
          ))}
          {showAddOption && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--accent-purple)',
                cursor: 'pointer',
              }}
            >
              {newOptionLabel(value.trim())}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
