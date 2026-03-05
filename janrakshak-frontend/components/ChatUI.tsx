"use client";

import { useState } from "react";
import { verifyClaim, type ClaimVerificationResponse } from "@/lib/api";
import { Loader2, Send, ShieldQuestion } from "lucide-react";

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; data?: ClaimVerificationResponse };

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! I am the JanRakshak Ai civic assistant. Ask me about government schemes, benefits, and viral claims – I will try to verify them for you."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError(null);
    const userMessage: Message = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await verifyClaim(trimmed);
      const reply: Message = {
        role: "assistant",
        content: res.explanation,
        data: res
      };
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel grid min-h-[480px] grid-rows-[auto,1fr,auto] rounded-hero p-6 md:p-8">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary text-white">
          <ShieldQuestion className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-sora text-[24px] font-semibold text-text-primary md:text-[28px]">
            Claim verification chatbot
          </h1>
          <p className="text-xs text-text-muted md:text-sm">
            Ask about schemes, benefits, and viral messages. I will try to
            classify them as true, false, or misleading and show why.
          </p>
        </div>
      </div>

      <div className="mb-4 mt-2 space-y-3 overflow-y-auto rounded-card bg-card-soft p-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-accent-primary text-white rounded-br-sm"
                  : "bg-white text-text-secondary rounded-bl-sm"
              }`}
            >
              <p>{m.content}</p>
              {m.role === "assistant" && m.data && (
                <div className="mt-2 space-y-1 text-xs">
                  <div>
                    <span className="font-semibold text-text-primary">
                      Verdict:
                    </span>{" "}
                    <span>{m.data.verdict}</span>
                  </div>
                  {m.data.sources && m.data.sources.length > 0 && (
                    <div>
                      <span className="font-semibold text-text-primary">
                        Sources:
                      </span>
                      <ul className="mt-1 list-disc pl-4">
                        {m.data.sources.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Loader2 className="h-3 w-3 animate-spin" />
            Verifying claim with AI...
          </div>
        )}
      </div>

      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2 rounded-pill bg-card-soft px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder='e.g. "Is PM Kisan scheme free?"'
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-light"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary text-white hover:bg-accent-primaryDeep disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-status-danger">{error}</p>}
        <p className="text-[11px] text-text-light">
          This assistant is for informational support only and should be
          cross-checked with official government sources for sensitive
          decisions.
        </p>
      </div>
    </div>
  );
}

