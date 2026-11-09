"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Loader2, Palette, Sparkles } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";
import { getAdSlot } from "@/lib/ads";

const SAMPLE_PROMPT = "Create a premium SaaS launch card with a glowing violet button and soft glassmorphism background";

function normalizeHtml(markup: string) {
  const cleaned = markup.trim().replace(/```html/gi, "").replace(/```/g, "").trim();
  return cleaned;
}

function renderCompactPreview(markup: string) {
  const html = normalizeHtml(markup);
  return `<!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        html, body { margin: 0; width: 100%; height: 100%; background: transparent; }
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        * { box-sizing: border-box; }
      </style>
    </head>
    <body>
      <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
        ${html}
      </div>
    </body>
  </html>`;
}

export default function TailwindUiPage() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [htmlCode, setHtmlCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const previewHtml = useMemo(() => renderCompactPreview(htmlCode), [htmlCode]);

  const generateFromPrompt = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please describe the UI you want to generate.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-tailwind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Tailwind generation failed.");

      const nextHtml = typeof data?.html === "string" ? data.html : "";
      if (!nextHtml) {
        throw new Error("The model returned an empty response.");
      }

      setHtmlCode(normalizeHtml(nextHtml));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadHtml = () => {
    const blob = new Blob([htmlCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codeglow-component.html";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <main className="min-h-screen bg-[#070b14] px-3 py-8 text-zinc-100 sm:px-5 lg:px-8">
        <div className="mx-auto w-full max-w-[1680px] space-y-8">
          <AdBanner
            label="Google AdSense 728x90 Leaderboard"
            className="mx-auto max-w-3xl"
            slot={getAdSlot("tailwind")}
          />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 shadow-lg shadow-violet-500/30">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-100/80">Design lab</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">CSS Playground & AI Tailwind Generator</h1>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0b1322]/90 p-4 sm:p-5">
              <label className="block text-sm font-medium text-zinc-200 sm:text-[15px]">Describe the UI you want</label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-[#0d1a2d] p-3 text-sm text-zinc-100 outline-none transition focus:border-violet-400/80 sm:text-[15px]"
                placeholder="Example: premium SaaS dashboard card with pink-purple gradients and a neon CTA"
              />

              <button
                type="button"
                onClick={() => void generateFromPrompt()}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? "Generating UI..." : "Generate UI"}
              </button>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0b1322]/90 p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200 sm:text-[15px]">HTML editor</span>
                </div>

                <textarea
                  value={htmlCode}
                  onChange={(event) => setHtmlCode(event.target.value)}
                  rows={18}
                  spellCheck={false}
                  className="min-h-[420px] w-full resize-none rounded-2xl border border-white/10 bg-[#0d1a2d] p-3 font-mono text-[12px] leading-6 text-emerald-200 outline-none transition focus:border-violet-400/80 sm:text-[13px]"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={downloadHtml}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-violet-400/50"
                  >
                    <Download className="h-4 w-4" />
                    Download HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyHtml()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-violet-400/50"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy HTML"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0b1322]/90 p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200 sm:text-[15px]">Live preview</span>
              </div>

              <div className="overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),_rgba(15,23,42,0.95)_48%,_rgba(2,6,23,0.98)_100%)]">
                <iframe
                  title="Tailwind preview"
                  srcDoc={previewHtml}
                  sandbox="allow-scripts"
                  className="block h-[500px] w-full border-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
