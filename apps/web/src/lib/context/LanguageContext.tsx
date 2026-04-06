'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'es';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLang(): Lang {
  if (typeof window !== 'undefined') {
    return navigator.language.startsWith('es') ? 'es' : 'en';
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  const toggleLang = () => setLang(lang === 'en' ? 'es' : 'en');

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
