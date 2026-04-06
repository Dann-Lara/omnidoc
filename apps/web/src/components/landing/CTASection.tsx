"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Phone } from "lucide-react";

interface CTASectionProps {
  lang: "en" | "es";
}

const content = {
  en: {
    title: "Ready to modernize your clinical architecture?",
    subtitle: "Join 400+ leading medical institutions using OmniDoc to power their patient journeys.",
    ctaPrimary: "Book a Demo",
    ctaSecondary: "Contact Sales",
  },
  es: {
    title: "¿Listo para modernizar tu arquitectura clínica?",
    subtitle: "Únete a más de 400 instituciones médicas líderes usando OmniDoc para potenciar el viaje de sus pacientes.",
    ctaPrimary: "Reservar Demo",
    ctaSecondary: "Contactar Ventas",
  },
};

export function CTASection({ lang }: CTASectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = content[lang];

  return (
    <section ref={ref} className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <div className="clinical-gradient rounded-[2rem] p-12 lg:p-20 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_currentColor_100%)]" />
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-3xl lg:text-5xl font-extrabold text-white mb-6 max-w-3xl mx-auto leading-tight"
            >
              {t.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-lg max-w-xl mx-auto mb-10"
            >
              {t.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg shadow-xl"
              >
                {t.ctaPrimary}
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
              >
                <Phone className="inline-block mr-2 w-5 h-5" />
                {t.ctaSecondary}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
