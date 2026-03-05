"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ShieldCheck, MessageCircle } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "Deepfake Detector",
    description:
      "Analyze video and audio for AI-generated manipulation with clear, citizen-friendly explanations."
  },
  {
    icon: MessageCircle,
    title: "Claim Verification Chatbot",
    description:
      "Ask questions about government schemes and policies; get AI-backed, source-linked answers."
  },
  {
    icon: ShieldCheck,
    title: "Misinformation Shield",
    description:
      "Paste rumors and get true/false verdicts, simple explanations, and the official facts."
  }
];

export function FeatureCards() {
  return (
    <section className="mt-16">
      <h2 className="font-sora text-[32px] font-semibold text-text-primary md:text-[36px]">
        One platform, three civic shields
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-text-muted md:text-base">
        JanRakshak Ai combines deepfake detection, claim verification, and
        rumor debunking into a single national safety layer for digital
        information.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-panel rounded-card p-6 shadow-soft hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-sora text-[20px] font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

