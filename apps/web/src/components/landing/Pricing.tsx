"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Sparkles } from "lucide-react";

interface PricingProps {
  lang: "en" | "es";
}

const content = {
  en: {
    sectionSubtitle: "Pricing",
    sectionTitle: "Simple, Transparent Pricing",
    plans: {
      free: {
        name: "Starter",
        description: "Perfect for solo practitioners getting started",
        price: "$0",
        period: "/month",
        features: [
          "Up to 100 appointments/month",
          "Basic scheduling",
          "1 user",
          "Email support",
        ],
        cta: "Get Started Free",
      },
      basic: {
        name: "Professional",
        description: "For growing clinics and practices",
        price: "$49",
        period: "/month",
        features: [
          "Unlimited appointments",
          "AI-powered scheduling",
          "Up to 10 users",
          "Patient management",
          "Priority support",
          "Analytics dashboard",
        ],
        cta: "Start Free Trial",
        popular: true,
      },
      enterprise: {
        name: "Enterprise",
        description: "For hospitals and healthcare networks",
        price: "Custom",
        period: "",
        features: [
          "Everything in Professional",
          "Unlimited users",
          "Custom integrations",
          "Dedicated account manager",
          "SLA guarantee",
          "HIPAA compliance",
        ],
        cta: "Contact Sales",
      },
    },
  },
  es: {
    sectionSubtitle: "Precios",
    sectionTitle: "Precios Simples y Transparentes",
    plans: {
      free: {
        name: "Inicial",
        description: "Perfecto para profesionales independientes que comienzan",
        price: "$0",
        period: "/mes",
        features: [
          "Hasta 100 citas/mes",
          "Programación básica",
          "1 usuario",
          "Soporte por email",
        ],
        cta: "Comenzar Gratis",
      },
      basic: {
        name: "Profesional",
        description: "Para clínicas y consultorios en crecimiento",
        price: "$49",
        period: "/mes",
        features: [
          "Citas ilimitadas",
          "Programación con IA",
          "Hasta 10 usuarios",
          "Gestión de pacientes",
          "Soporte prioritario",
          "Panel de análisis",
        ],
        cta: "Prueba Gratuita",
        popular: true,
      },
      enterprise: {
        name: "Empresarial",
        description: "Para hospitales y redes sanitarias",
        price: "Custom",
        period: "",
        features: [
          "Todo en Profesional",
          "Usuarios ilimitados",
          "Integraciones personalizadas",
          "Gerente de cuenta dedicado",
          "Garantía SLA",
          "Cumplimiento HIPAA",
        ],
        cta: "Contactar Ventas",
      },
    },
  },
};

export function Pricing({ lang }: PricingProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = content[lang];

  return (
    <section id="pricing" ref={ref} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-tint mb-3">
            {t.sectionSubtitle}
          </p>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight">
            {t.sectionTitle}
          </h2>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(t.plans).map(([key, plan], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-primary text-white scale-105 shadow-2xl"
                  : "bg-surface-container-lowest"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-primary text-sm font-bold">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-primary"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? "text-white/70" : "text-on-surface-variant"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span className={`text-4xl font-extrabold ${plan.popular ? "text-white" : "text-primary"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.popular ? "text-white/70" : "text-on-surface-variant"}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 ${
                        plan.popular ? "text-white" : "text-success"
                      }`}
                    />
                    <span className={`text-sm ${plan.popular ? "text-white/90" : "text-on-surface"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                  plan.popular
                    ? "bg-white text-primary hover:bg-white/90"
                    : "clinical-gradient text-on-primary"
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
