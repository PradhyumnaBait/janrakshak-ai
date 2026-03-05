"use client";

import { useState } from "react";
import { simplifyMisinformation, type MisinformationResponse } from "@/lib/api";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";

export function MisinformationForm() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MisinformationResponse | null>(null);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await simplifyMisinformation(trimmed);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze this text."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel grid gap-8 rounded-hero p-6 md:grid-cols-2 md:p-8">
      <div>
        <h1 className="font-sora text-[28px] font-semibold text-text-primary md:text-[32px]">
          Misinformation shield
        </h1>
        <p className="mt-2 text-sm text-text-muted md:text-base">
          Paste a rumor, forward, or viral message. JanRakshak Ai will help
          explain what&apos;s true, what&apos;s misleading, and what official
          information says.
        </p>

        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            Rumor or message text
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={8}
            placeholder='e.g. "Government is charging money for Aadhaar update."'
            className="w-full rounded-card border border-transparent bg-card-soft px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-light focus:border-accent-primary"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 inline-flex items-center gap-2 rounded-pill bg-accent-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:bg-accent-primaryDeep disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing rumor...
              </>
            ) : (
              <>
                Check for misinformation
              </>
            )}
          </button>
          {error && <p className="text-xs text-status-danger">{error}</p>}
        </div>
      </div>

      <div className="flex flex-col rounded-card bg-card-soft p-4 text-sm text-text-secondary">
        {!result && (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-text-muted">
            <ShieldCheck className="mb-3 h-6 w-6 text-accent-primary" />
            <p>
              Your explanation will appear here, including a simple verdict and
              a citizen-friendly breakdown.
            </p>
          </div>
        )}
        {result && (
          <div className="space-y-4">
            <div className="rounded-card bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-light">
                Rumor text
              </div>
              <p className="mt-1 text-sm text-text-secondary">{result.original}</p>
            </div>
            <div className="rounded-card bg-deep-darker/90 p-4 text-sm text-white">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-status-warning">
                <AlertTriangle className="h-4 w-4" />
                Civic explanation
              </div>
              <p className="whitespace-pre-line text-sm">{result.simplified}</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-pill border border-accent-primary/40 px-4 py-2 text-xs font-medium text-accent-primary hover:bg-accent-primary/5"
            >
              Share this explanation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

