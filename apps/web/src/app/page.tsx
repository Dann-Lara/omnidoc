"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import { Navbar, Hero, Features, Pricing, CTASection, Footer } from "@/components/landing";

export default function LandingPage() {
  const { lang } = useLanguage();

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
