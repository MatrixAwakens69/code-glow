"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

const DEFAULT_PROMPT = "Generate a sleek black bell vector icon with white background.";
const MAX_GENERATED_LINES = 1000;

function limitGeneratedLines(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const lines = trimmed.split(/\r?\n/);
  if (lines.length <= MAX_GENERATED_LINES) return trimmed;

  return lines.slice(0, MAX_GENERATED_LINES).join("\n");
}

function sanitizeSvg(svg: string) {
  const cleaned = svg.trim();
  if (!cleaned) return "";
  const withoutFence = cleaned.replace(/```svg/gi, "").replace(/```/g, "").trim();
  const match = withoutFence.match(/<svg[\s\S]*?<\/svg>/i);
  const parsed = match ? match[0] : withoutFence;
  return limitGeneratedLines(parsed);
}

export default function SvgGeneratorPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [svgCode, setSvgCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateSvg = async (nextPrompt: string) => {
    const trimmed = nextPrompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt before generating an SVG.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "SVG generation failed.");
      setSvgCode(sanitizeSvg(String(data.svg || "")));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const previewSvg = useMemo(() => sanitizeSvg(svgCode), [svgCode]);

  const copySvg = async () => {
    await navigator.clipboard.writeText(previewSvg);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadSvg = () => {
    if (!previewSvg) return;
    const blob = new Blob([previewSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codeglow-generated.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!previewSvg) return;
    const svgBlob = new Blob([previewSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const width = image.naturalWidth || 1200;
      const height = image.naturalHeight || 800;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = pngUrl;
        anchor.download = "codeglow-generated.png";
        anchor.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");

      URL.revokeObjectURL(url);
    };

    image.src = url;
  };

  return (
    <main className="min-h-screen bg-[#070b14] px-5 py-8 text-zinc-100 lg:px-8">
      <div className="mx-auto max-w-[1700px] space-y-8">
        <AdBanner label="Google AdSense 728x90 Leaderboard" className="mx-auto max-w-3xl" />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-orange-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Prompt-to-vector</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">SVG Generator</h1>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0b1322]/90 p-4">
              <label className="block text-sm font-medium text-zinc-200">Describe the SVG you want</label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-[#0d1a2d] p-3 text-sm text-zinc-100 outline-none transition focus:border-violet-400/80"
                placeholder="Example: minimalist rocket icon with warm gradients and crisp geometry"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void generateSvg(prompt)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isLoading ? "Generating SVG..." : "Generate SVG"}
                </button>

                <button
                  type="button"
                  onClick={() => void copySvg()}
                  disabled={!previewSvg}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0b1322]/90 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">SVG editor</span>
                </div>

                <textarea
                  value={svgCode}
                  onChange={(event) => setSvgCode(event.target.value)}
                  rows={18}
                  spellCheck={false}
                  className="min-h-[420px] w-full resize-none rounded-2xl border border-white/10 bg-[#0d1a2d] p-3 font-mono text-[12px] leading-6 text-amber-100 outline-none transition focus:border-violet-400/80"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0b1322]/90 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200">Live preview</span>
              </div>

              <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_rgba(15,23,42,0.95)_48%,_rgba(2,6,23,0.98)_100%)] p-3">
                {previewSvg ? (
                  <div className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:object-contain" dangerouslySetInnerHTML={{ __html: previewSvg }} />
                ) : (
                  <div className="text-sm text-zinc-500">Your SVG preview will appear here.</div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={downloadPng} disabled={!previewSvg} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">
                  <Download className="h-4 w-4" />
                  PNG
                </button>
                <button type="button" onClick={downloadSvg} disabled={!previewSvg} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-violet-400/50 disabled:cursor-not-allowed disabled:opacity-50">
                  <Download className="h-4 w-4" />
                  SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
