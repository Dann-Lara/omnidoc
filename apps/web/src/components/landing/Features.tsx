"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Brain, Stethoscope, Shield, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";

interface FeaturesProps {
  lang: "en" | "es";
}

const content = {
  en: {
    sectionSubtitle: "Clinical Infrastructure",
    sectionTitle: "Precision-Engineered Components",
    superAgenda: {
      title: "The Súper Agenda",
      description: "Spatial and professional synchronization. Manage physical rooms, specialized equipment, and medical staff availability in a single, unified view.",
    },
    aiAntiNoShow: {
      title: "IA Anti-NoShow",
      description: "Predictive rescheduling that identifies patterns before they become vacancies. Optimize your clinical density automatically.",
      stat: "42%",
      statLabel: "Reduction in missed slots",
    },
    smartTriage: {
      title: "Smart Triage",
      description: "Dynamic patient intake that adapts to symptoms. Route cases to the right specialist instantly with automated urgency tagging.",
      alert: "High Urgency Detected",
      action: "Routing to Cardiology Dept.",
    },
    handshake: {
      title: "The Handshake Protocol",
      description: "On-demand support access with zero privacy friction. Secure, time-limited, and audited sessions that protect patient data while you get help.",
      cta: "Read technical whitepaper",
    },
  },
  es: {
    sectionSubtitle: "Infraestructura Clínica",
    sectionTitle: "Componentes de Precisión",
    superAgenda: {
      title: "La Súper Agenda",
      description: "Sincronización espacial y profesional. Gestiona salas físicas, equipos especializados y disponibilidad del personal médico en una vista unificada.",
    },
    aiAntiNoShow: {
      title: "IA Anti-Ausencias",
      description: "Reprogramación predictiva que identifica patrones antes de que se conviertan en vacantes. Optimiza tu densidad clínica automáticamente.",
      stat: "42%",
      statLabel: "Reducción de citas perdidas",
    },
    smartTriage: {
      title: "Triaje Inteligente",
      description: "Admisión dinámica de pacientes que se adapta a los síntomas. Dirige casos al especialista correcto instantáneamente con etiquetado automático de urgencia.",
      alert: "Alta Urgencia Detectada",
      action: "Dirigiendo a Cardiología",
    },
    handshake: {
      title: "El Protocolo de Handshake",
      description: "Acceso de soporte bajo demanda sin fricción de privacidad. Sesiones seguras, limitadas en tiempo y auditadas que protegen los datos de los pacientes mientras obtienes ayuda.",
      cta: "Leer whitepaper técnico",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function Features({ lang }: FeaturesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = content[lang];

  return (
    <section id="features" ref={ref} className="py-24 px-6 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-tint mb-3">
            {t.sectionSubtitle}
          </p>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight">
            {t.sectionTitle}
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Súper Agenda - Large */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bento-item-8 bg-surface-container-lowest rounded-2xl overflow-hidden group"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary">{t.superAgenda.title}</h3>
              </div>
              <p className="text-on-surface-variant max-w-lg">{t.superAgenda.description}</p>
            </div>
            <motion.div
              className="px-8 pb-8 transition-transform duration-500 group-hover:scale-[1.02]"
            >
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/5 to-primary-container/10 flex items-center justify-center border border-outline-variant">
                <Calendar className="w-20 h-20 text-primary/30" />
              </div>
            </motion.div>
          </motion.div>

          {/* AI Anti-NoShow - Gradient Card */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bento-item-4 clinical-gradient rounded-2xl p-8 flex flex-col justify-between text-white"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.aiAntiNoShow.title}</h3>
              <p className="text-white/80 leading-relaxed">{t.aiAntiNoShow.description}</p>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">{t.aiAntiNoShow.stat}</span>
                <span className="text-sm mb-1 opacity-60">{t.aiAntiNoShow.statLabel}</span>
              </div>
            </div>
          </motion.div>

          {/* Smart Triage */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bento-item-5 bg-surface-container rounded-2xl p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-surface-tint mb-6">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">{t.smartTriage.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{t.smartTriage.description}</p>
            </div>
            <div className="mt-12 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-error rounded-full" />
                <div>
                  <p className="text-xs font-bold text-on-surface-variant">{t.smartTriage.alert}</p>
                  <p className="text-sm font-bold text-primary">{t.smartTriage.action}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Handshake Protocol */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bento-item-7 bg-surface-container-lowest rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="flex-1">
              <p className="text-xs font-bold text-surface-tint uppercase tracking-widest mb-2">
                Security Engine
              </p>
              <h3 className="text-2xl font-bold text-primary mb-4">{t.handshake.title}</h3>
              <p className="text-on-surface-variant mb-6">{t.handshake.description}</p>
              <button className="text-primary font-bold text-sm flex items-center gap-2 group">
                {t.handshake.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="w-48 h-48 flex-shrink-0 bg-surface-container rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border-4 border-dashed border-primary/10 rounded-full animate-spin-slow" />
              <Shield className="w-16 h-16 text-primary" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
