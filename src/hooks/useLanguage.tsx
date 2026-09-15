import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { detectLang, translations, type Dict, type Lang } from '../i18n';

const STORAGE_KEY = 'puzzle-tracker:lang';

interface LanguageValue {
  lang: Lang;
  t: Dict;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageValue | null>(null);

function readStoredLang(): Lang | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'fr' || stored === 'en' ? stored : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => readStoredLang() ?? detectLang());

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const value: LanguageValue = {
    lang,
    t: translations[lang],
    toggleLang: () => setLang((l) => (l === 'fr' ? 'en' : 'fr')),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
