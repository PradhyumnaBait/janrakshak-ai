"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Video, MessageCircle } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="mt-8 grid gap-8 md:grid-cols-[3fr,2fr]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-hero p-8 md:p-12"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-pill bg-card-soft px-4 py-2 text-xs font-medium text-text-muted">
          <Sparkles className="h-4 w-4 text-accent-primary" />
          National civic misinformation defense platform
        </div>
        <h1 className="font-sora text-[40px] font-bold leading-tight tracking-[-0.02em] text-text-primary md:text-[64px]">
          Protect Truth. Detect Deepfakes. Empower Citizens.
        </h1>
        <p className="mt-4 max-w-xl text-base text-text-secondary md:text-lg">
          AI-powered shield for India&apos;s citizens, helping verify videos,
          speeches, and claims about government schemes and elections in
          seconds.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/deepfake"
            className="inline-flex items-center gap-2 rounded-pill bg-accent-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:bg-accent-primaryDeep"
          >
            <Video className="h-4 w-4" />
            Check Video
          </Link>
          <Link
            href="/verify-claim"
            className="inline-flex items-center gap-2 rounded-pill bg-card-soft px-6 py-3 text-sm font-medium text-text-primary shadow-soft hover:bg-card-softer"
          >
            <MessageCircle className="h-4 w-4" />
            Ask AI
          </Link>
          <Link
            href="/misinformation-shield"
            className="inline-flex items-center gap-2 rounded-pill border border-accent-primary/40 bg-transparent px-6 py-3 text-sm font-medium text-accent-primary hover:bg-accent-primary/5"
          >
            Verify Claim
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 text-xs text-text-muted md:grid-cols-3">
          <div>
            <div className="text-text-light">Powered by</div>
            <div className="font-medium text-text-secondary">
              AI Deepfake &amp; RAG
            </div>
          </div>
          <div>
            <div className="text-text-light">Designed for</div>
            <div className="font-medium text-text-secondary">
              Government &amp; citizens
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-status-success" />
            <span>Privacy-safe civic analytics</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-panel flex flex-col justify-between rounded-hero p-6 md:p-8"
      >
        <div>
          <h2 className="font-sora text-xl font-semibold text-text-primary">
            Real-time civic threat radar
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Monitor deepfakes, suspicious claims, and viral rumors across
            platforms with a single, unified AI shield.
          </p>
        </div>
        <div className="mt-6 space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-card bg-card-soft px-4 py-3">
            <span className="text-text-secondary">Deepfake alerts (24h)</span>
            <span className="font-semibold text-status-danger">34</span>
          </div>
          <div className="flex items-center justify-between rounded-card bg-card-soft px-4 py-3">
            <span className="text-text-secondary">Claims verified</span>
            <span className="font-semibold text-status-success">182</span>
          </div>
          <div className="flex items-center justify-between rounded-card bg-card-soft px-4 py-3">
            <span className="text-text-secondary">Rumors neutralised</span>
            <span className="font-semibold text-status-warning">67</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

