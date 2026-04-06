'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/lib/context/LanguageContext';

const translations = {
  en: {
    features: 'Features',
    security: 'Security',
    pricing: 'Pricing',
    getStarted: 'Get Started',
  },
  es: {
    features: 'Características',
    security: 'Seguridad',
    pricing: 'Precios',
    getStarted: 'Comenzar',
  },
};

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
  const { lang, toggleLang } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations[lang];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tighter text-primary"
          >
            OmniDoc
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">{t.features}</NavLink>
            <NavLink href="#security">{t.security}</NavLink>
            <NavLink href="#pricing">{t.pricing}</NavLink>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium uppercase">{lang}</span>
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:block clinical-gradient text-on-primary px-5 py-2 rounded-lg font-semibold text-sm"
            >
              {t.getStarted}
            </motion.button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4 pb-2"
            >
              <div className="flex flex-col gap-2">
                <MobileNavLink href="#features" onClick={() => setIsMobileMenuOpen(false)}>
                  {t.features}
                </MobileNavLink>
                <MobileNavLink href="#security" onClick={() => setIsMobileMenuOpen(false)}>
                  {t.security}
                </MobileNavLink>
                <MobileNavLink href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>
                  {t.pricing}
                </MobileNavLink>
                <button className="clinical-gradient text-on-primary px-5 py-3 rounded-lg font-semibold text-sm mt-2">
                  {t.getStarted}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="font-semibold tracking-tight text-sm text-on-surface-variant hover:text-primary transition-colors"
    >
      {children}
    </a>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block px-4 py-3 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
    >
      {children}
    </a>
  );
}
