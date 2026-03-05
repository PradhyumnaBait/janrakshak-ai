"use client";

import { useEffect, useState } from "react";
import { Activity, Film, MessageCircle, ShieldAlert } from "lucide-react";

type DashboardData = {
  analyses: number;
  fakeVideos: number;
  claimsVerified: number;
  rumorsChecked: number;
};

const initialData: DashboardData = {
  analyses: 324,
  fakeVideos: 87,
  claimsVerified: 192,
  rumorsChecked: 145
};

export function DashboardStats() {
  const [data] = useState<DashboardData>(initialData);

  // Placeholder: could fetch real stats from backend in the future.
  useEffect(() => {
    // fetch stats here
  }, []);

  const cards = [
    {
      icon: Activity,
      label: "Total analyses",
      value: data.analyses,
      tone: "neutral"
    },
    {
      icon: Film,
      label: "Fake videos detected",
      value: data.fakeVideos,
      tone: "danger"
    },
    {
      icon: MessageCircle,
      label: "Claims verified",
      value: data.claimsVerified,
      tone: "success"
    },
    {
      icon: ShieldAlert,
      label: "Rumors checked",
      value: data.rumorsChecked,
      tone: "warning"
    }
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-sora text-[28px] font-semibold text-text-primary md:text-[32px]">
          Civic protection dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted md:text-base">
          High-level view of how JanRakshak Ai is helping citizens and officials
          analyze media, verify claims, and neutralize rumors.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {cards.map(card => {
          const Icon = card.icon;
          const toneClasses =
            card.tone === "success"
              ? "text-status-success bg-status-success/10"
              : card.tone === "danger"
                ? "text-status-danger bg-status-danger/10"
                : card.tone === "warning"
                  ? "text-status-warning bg-status-warning/10"
                  : "text-accent-primary bg-accent-primary/10";

          return (
            <div
              key={card.label}
              className="glass-panel flex flex-col rounded-card p-4"
            >
              <div
                className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full ${toneClasses}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-medium text-text-light">
                {card.label}
              </div>
              <div className="mt-1 text-2xl font-semibold text-text-primary">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel rounded-hero p-6 text-sm text-text-secondary md:p-8">
        <h2 className="font-sora text-lg font-semibold text-text-primary">
          Recent civic insights
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          In a full deployment, this section would list real recent analyses –
          such as flagged deepfakes, verified claims, and resolved rumors – with
          timestamps and categories.
        </p>
        <ul className="mt-4 space-y-2 text-xs text-text-muted">
          <li>• 4 suspicious election-related videos flagged in the last 24h</li>
          <li>
            • 12 claims about subsidy schemes verified with official data
          </li>
          <li>
            • 7 viral messages about identity documents explained in simple
            language
          </li>
        </ul>
      </div>
    </section>
  );
}

