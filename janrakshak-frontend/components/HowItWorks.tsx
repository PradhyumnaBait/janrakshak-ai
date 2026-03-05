"use client";

import { motion } from "framer-motion";
import { UploadCloud, ScanSearch, CheckCircle2, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload",
    description: "Citizens or officials upload videos, audio, or claims."
  },
  {
    icon: ScanSearch,
    title: "Analyze",
    description: "AI models inspect media and text for signs of manipulation."
  },
  {
    icon: CheckCircle2,
    title: "Verify",
    description: "Claims are checked against trusted government data sources."
  },
  {
    icon: Lightbulb,
    title: "Explain",
    description: "Results are translated into simple, accessible language."
  }
];

export function HowItWorks() {
  return (
    <section className="mt-16">
      <h2 className="font-sora text-[32px] font-semibold text-text-primary md:text-[36px]">
        How JanRakshak Ai works
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-text-muted md:text-base">
        A transparent four-step pipeline that keeps citizens informed without
        overwhelming them with technical jargon.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-panel flex flex-col rounded-card p-5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-semibold text-text-light">
                Step {index + 1}
              </div>
              <h3 className="mt-1 font-sora text-base font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-1 text-xs text-text-muted md:text-sm">
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

