"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/deepfake", label: "Deepfake Detector" },
  { href: "/verify-claim", label: "Claim Chatbot" },
  { href: "/misinformation-shield", label: "Misinformation Shield" },
  { href: "/dashboard", label: "Dashboard" }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="px-6 pt-6 md:px-12 lg:px-24">
      <nav className="glass-panel flex items-center justify-between rounded-hero px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-deep-darker text-white shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="font-sora text-lg font-semibold text-text-primary">
              JanRakshak Ai
            </div>
            <div className="text-xs font-medium text-text-muted">
              Civic Misinformation Shield
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-6 text-sm font-medium text-text-muted md:flex">
          {links.map(link => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-2 py-1"
              >
                <span
                  className={
                    active
                      ? "text-text-primary"
                      : "transition-colors hover:text-text-primary"
                  }
                >
                  {link.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-accent-primary"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

