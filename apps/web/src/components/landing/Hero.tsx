"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Shield } from "lucide-react";

interface HeroProps {
  lang: "en" | "es";
}

const content = {
  en: {
    badge: "Now with V2 Core Engine",
    title: "The Sovereign Operating System for Clinical Growth.",
    subtitle:
      "Designed for high-performance healthcare environments. Orchestrate complex workflows with medical-grade precision and unmatched scalability.",
    ctaPrimary: "Request Demo",
    ctaSecondary: "Contact Sales",
    stats: {
      specialties: "Medical Specialties",
      supported: "Supported",
    },
    features: [
      {
        title: "Atomic Scalability",
        description: "One chair to multi-city clusters.",
        icon: "scale",
      },
      {
        title: "Privacy by Design",
        description: "Zero-friction compliance logic.",
        icon: "shield",
      },
    ],
  },
  es: {
    badge: "Ahora con Motor Central V2",
    title: "El Sistema Operativo Soberano para el Crecimiento Clínico.",
    subtitle:
      "Diseñado para entornos sanitarios de alto rendimiento. Orchestra flujos de trabajo complejos con precisión médica y escalabilidad inigualable.",
    ctaPrimary: "Solicitar Demo",
    ctaSecondary: "Contactar Ventas",
    stats: {
      specialties: "Especialidades Médicas",
      supported: "Soportadas",
    },
    features: [
      {
        title: "Escalabilidad Atómica",
        description: "De una silla a clusters multiciudad.",
        icon: "scale",
      },
      {
        title: "Privacidad por Diseño",
        description: "Lógica de cumplimiento sin fricción.",
        icon: "shield",
      },
    ],
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
  },
};

export function Hero({ lang }: HeroProps) {
  const t = content[lang];

  return (
    <section className="pt-32 pb-20 lg:py-40 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-8"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-sm font-bold uppercase tracking-widest text-primary">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {t.badge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-primary"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {t.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-on-surface-variant max-w-xl leading-relaxed"
            >
              {t.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="clinical-gradient text-on-primary px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
              >
                {t.ctaPrimary}
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-outline-variant hover:bg-surface-container transition-colors"
              >
                {t.ctaSecondary}
              </motion.button>
            </motion.div>

            {/* Feature Cards */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              {t.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center">
                    {feature.icon === "scale" ? (
                      <Calendar className="w-5 h-5 text-primary" />
                    ) : (
                      <Shield className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{feature.title}</p>
                    <p className="text-xs text-on-surface-variant">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest p-2">
              {/* Placeholder for dashboard image */}
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/10 to-primary-container/20 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl clinical-gradient flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-primary font-bold">OmniDoc Dashboard</p>
                  <p className="text-sm text-on-surface-variant">
                    AI-Powered Medical Scheduling
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container/30 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary-container/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20 flex items-center justify-center gap-8 text-center"
        >
          <div>
            <p className="text-4xl font-extrabold text-primary">50+</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
              {t.stats.specialties}
            </p>
          </div>
          <div className="w-px h-12 bg-outline-variant" />
          <div>
            <p className="text-4xl font-extrabold text-primary">99.9%</p>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
              Uptime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
