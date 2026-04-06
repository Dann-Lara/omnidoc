"use client";

import { useState, useEffect } from "react";
import { Navbar, Hero, Features, Pricing, CTASection, Footer } from "@/components/landing";

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const browserLang = navigator.language.startsWith("es") ? "es" : "en";
    setLang(browserLang);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        <Hero lang={lang} />
        <Features lang={lang} />
        <Pricing lang={lang} />
        <CTASection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
