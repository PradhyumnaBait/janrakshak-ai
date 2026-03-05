"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Activity } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Government-grade AI",
    description:
      "Designed to integrate with official data sources and national fact-check systems."
  },
  {
    icon: Lock,
    title: "Privacy-safe by design",
    description:
      "We minimize data retention and avoid storing unnecessary personal information."
  },
  {
    icon: Activity,
    title: "Real-time detection",
    description:
      "Fast feedback loops so citizens can verify content before it goes viral."
  }
];

export function TrustSection() {
  return (
    <section className="mt-16 mb-8">
      <div className="glass-panel rounded-hero p-8 md:p-10">
        <h2 className="font-sora text-[32px] font-semibold text-text-primary md:text-[36px]">
          Built for trust, not fear
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-muted md:text-base">
          JanRakshak Ai is a digital public good: transparent, privacy-aware,
          and focused on empowering citizens with accurate, accessible
          information.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-3 rounded-card bg-deep-darker/5 p-4"
              >
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-deep-darker text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sora text-sm font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted md:text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

