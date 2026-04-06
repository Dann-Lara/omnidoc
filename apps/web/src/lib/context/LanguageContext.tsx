'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

type Lang = 'en' | 'es';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'omnidoc-lang';

const emptySubscribe = () => () => {};

function getSnapshot(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'es') return stored;
  const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
  localStorage.setItem(STORAGE_KEY, browserLang);
  return browserLang;
}

function getServerSnapshot(): Lang {
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  const setLang = (newLang: Lang) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    window.location.reload();
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
