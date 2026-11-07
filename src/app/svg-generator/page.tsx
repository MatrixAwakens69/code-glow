"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";

const DEFAULT_PROMPT = "Create a modern, friendly vector icon of a rocket launching from a laptop screen with soft gradients and clean geometry.";

function sanitizeSvg(svg: string) {
  const cleaned = svg.trim();
  if (!cleaned) return "";

  let normalized = cleaned;
  if (!normalized.startsWith("<svg")) {
    normalized = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Generated SVG">${normalized}</svg>`;
  }

  normalized = normalized.replace(/<svg\s+/i, '<svg ');
  normalized = normalized.replace(/<svg\s+([^>]*?)>/i, (_match, attrs) => {
    const safeAttrs = attrs
      .replace(/\swidth=\s*["'][^"']*["']/gi, "")
      .replace(/\sheight=\s*["'][^"']*["']/gi, "")
      .trim();

    const hasViewBox = /\sviewBox\s*=/i.test(safeAttrs);
    const viewBoxAttribute = hasViewBox ? "" : ' viewBox="0 0 1200 800"';

    return `<svg ${safeAttrs}${viewBoxAttribute} preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;max-width:100%;max-height:100%;">`;
  });

  return normalized;
}

export default function SvgGeneratorPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void generateSvg(DEFAULT_PROMPT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateSvg = async (nextPrompt: string) => {
    const trimmed = nextPrompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt before generating an SVG.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/svg/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "SVG generation failed.");
      }

      setSvgMarkup(sanitizeSvg(String(data.svg || "")));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizedSvgMarkup = useMemo(() => sanitizeSvg(svgMarkup), [svgMarkup]);

  const copySvg = async () => {
    if (!svgMarkup) return;
    await navigator.clipboard.writeText(svgMarkup);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadSvg = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "codeglow-generated.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#070b14] px-5 py-8 text-zinc-100 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-orange-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Prompt-to-vector</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">SVG Generator</h1>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-4">
              <label className="mb-3 block text-sm font-medium text-zinc-200">Describe the SVG you want</label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={14}
                placeholder="e.g. Create a layered, futuristic icon of a productivity dashboard with a glowing checkmark, soft shadows, and a clean minimal palette."
                className="min-h-[260px] w-full resize-none rounded-2xl border border-white/10 bg-[#0b1020] p-4 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-400/60"
              />

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => void generateSvg(prompt)}
                  disabled={isLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isLoading ? "Generating..." : "Generate SVG"}
                </button>
              </div>

              {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
            </div>

            <div className="space-y-4">
              <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_rgba(20,24,36,0.95)_50%,_rgba(2,6,23,0.98)_100%)] p-3">
                {normalizedSvgMarkup ? (
                  <div className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:object-contain" dangerouslySetInnerHTML={{ __html: normalizedSvgMarkup }} />
                ) : (
                  <div className="text-sm text-zinc-500">Your generated SVG preview will appear here.</div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={downloadSvg} disabled={!normalizedSvgMarkup} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">
                  <Download className="h-4 w-4" />
                  Download SVG
                </button>
                <button type="button" onClick={copySvg} disabled={!normalizedSvgMarkup} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-violet-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy SVG"}
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">SVG code</span>
                </div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-black/20 p-3 text-[11px] leading-5 text-amber-100">
                  {normalizedSvgMarkup || "// output will show here after generation"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
