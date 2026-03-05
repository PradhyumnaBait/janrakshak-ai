"use client";

import { useState } from "react";
import { uploadDeepfake, type DeepfakeResponse } from "@/lib/api";
import { CloudUpload, Link2, Loader2 } from "lucide-react";
import { DeepfakeResultCard } from "./DeepfakeResultCard";

type Props = {
  mode: "video" | "audio";
};

export function DeepfakeUploader({ mode }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeepfakeResponse | null>(null);

  const label = mode === "video" ? "Video" : "Audio";

  async function handleAnalyze() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      if (!file) {
        setError(`Please upload a ${label.toLowerCase()} file to analyze.`);
        return;
      }
      const res = await uploadDeepfake(mode, file);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[3fr,2fr]">
      <div className="glass-panel rounded-hero p-6 md:p-8">
        <h1 className="font-sora text-[32px] font-semibold text-text-primary md:text-[36px]">
          {label} deepfake detector
        </h1>
        <p className="mt-2 text-sm text-text-muted md:text-base">
          Upload a {label.toLowerCase()} or paste a link. JanRakshak Ai will
          estimate how likely it is to be AI-generated, and explain why.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-text-secondary">
            Upload {label.toLowerCase()} file
          </label>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer flex-1 items-center justify-center gap-2 rounded-card border border-dashed border-accent-primary/40 bg-card-soft px-4 py-6 text-sm text-text-muted hover:border-accent-primary hover:bg-card-softer">
              <CloudUpload className="h-5 w-5 text-accent-primary" />
              <span>
                {file ? file.name : `Click to select a ${label.toLowerCase()}`}
              </span>
              <input
                type="file"
                accept={mode === "video" ? "video/*" : "audio/*"}
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Or paste {label.toLowerCase()} URL (for future support)
            </label>
            <div className="flex items-center gap-2 rounded-card bg-card-soft px-3 py-2">
              <Link2 className="h-4 w-4 text-text-muted" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={`https://example.com/${label.toLowerCase()}`}
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-light"
              />
            </div>
            <p className="text-xs text-text-light">
              URL analysis can be wired to fetch and process remote media in a
              later phase.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-pill bg-accent-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:bg-accent-primaryDeep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Run deepfake analysis
              </>
            )}
          </button>
          {error && (
            <p className="mt-2 text-sm text-status-danger">{error}</p>
          )}
        </div>
      </div>

      <DeepfakeResultCard mode={mode} result={result} />
    </div>
  );
}

