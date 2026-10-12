import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'puzzle-tracker:accent';

export const ACCENT_IDS = ['rose', 'ocean', 'mint', 'coral', 'night', 'wine'] as const;
export type AccentId = (typeof ACCENT_IDS)[number];

// Mirrors the --accent-gradient value each [data-accent] sets in styles.css.
// Needed as plain strings (not var(--accent-gradient)) so a theme swatch can
// show its own color while a different theme is the one currently active.
export const ACCENT_GRADIENTS: Record<AccentId, string> = {
  rose: 'linear-gradient(135deg, oklch(68% 0.23 350), oklch(62% 0.19 320))',
  ocean: 'linear-gradient(135deg, oklch(65% 0.18 235), oklch(58% 0.16 265))',
  mint: 'linear-gradient(135deg, oklch(66% 0.17 165), oklch(60% 0.15 185))',
  coral: 'linear-gradient(135deg, oklch(70% 0.19 55), oklch(63% 0.2 30))',
  night: 'linear-gradient(135deg, oklch(62% 0.2 300), oklch(55% 0.18 275))',
  wine: 'linear-gradient(135deg, oklch(55% 0.18 15), oklch(45% 0.17 350))',
};

interface AccentThemeValue {
  accent: AccentId;
  setAccent: (accent: AccentId) => void;
}

const AccentThemeContext = createContext<AccentThemeValue | null>(null);

function readStoredAccent(): AccentId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (ACCENT_IDS as readonly string[]).includes(stored ?? '') ? (stored as AccentId) : 'rose';
}

export function AccentThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<AccentId>(() => readStoredAccent());

  useEffect(() => {
    if (accent === 'rose') {
      document.documentElement.removeAttribute('data-accent');
    } else {
      document.documentElement.setAttribute('data-accent', accent);
    }
    localStorage.setItem(STORAGE_KEY, accent);
  }, [accent]);

  return <AccentThemeContext.Provider value={{ accent, setAccent }}>{children}</AccentThemeContext.Provider>;
}

export function useAccentTheme(): AccentThemeValue {
  const ctx = useContext(AccentThemeContext);
  if (!ctx) throw new Error('useAccentTheme must be used within AccentThemeProvider');
  return ctx;
}
