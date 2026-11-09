"use client";

import { useMemo, useRef, useState } from "react";
import { Download, ImagePlus, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import Tesseract from "tesseract.js";
import { AdBanner } from "@/components/AdBanner";
import { getAdSlot } from "@/lib/ads";

type RedactionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function normalizeBox(box: { x0: number; y0: number; x1: number; y1: number }, imgWidth: number, imgHeight: number): RedactionBox {
  const x = (Math.min(box.x0, box.x1) / imgWidth) * 100;
  const y = (Math.min(box.y0, box.y1) / imgHeight) * 100;
  const width = (Math.abs(box.x1 - box.x0) / imgWidth) * 100;
  const height = (Math.abs(box.y1 - box.y0) / imgHeight) * 100;

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.min(100, Math.max(2, width + 4)),
    height: Math.min(100, Math.max(2, height + 4)),
  };
}

export default function RedactorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [watermark, setWatermark] = useState("CONFIDENTIAL");
  const [blurRadius, setBlurRadius] = useState(18);
  const [boxes, setBoxes] = useState<RedactionBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAutoRedacting, setIsAutoRedacting] = useState(false);
  const [draftBox, setDraftBox] = useState<RedactionBox | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [autoRedactionError, setAutoRedactionError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const imageMeta = useMemo(
    () => ({
      width: 1200,
      height: 800,
    }),
    []
  );

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
    setImageSrc(dataUrl);
    setBoxes([]);
    setAutoRedactionError("");
  };

  const beginSelection = (clientX: number, clientY: number) => {
    if (!containerRef.current || !imageSrc) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setDragStart({ x, y });
    setDraftBox({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const updateSelection = (clientX: number, clientY: number) => {
    if (!containerRef.current || !dragStart || !draftBox) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x1 = ((clientX - rect.left) / rect.width) * 100;
    const y1 = ((clientY - rect.top) / rect.height) * 100;

    setDraftBox({
      x: Math.min(dragStart.x, x1),
      y: Math.min(dragStart.y, y1),
      width: Math.abs(x1 - dragStart.x),
      height: Math.abs(y1 - dragStart.y),
    });
  };

  const finishSelection = () => {
    if (!draftBox || draftBox.width < 2 || draftBox.height < 2) {
      setDraftBox(null);
      setIsDrawing(false);
      setDragStart(null);
      return;
    }

    setBoxes((current) => [...current, draftBox]);
    setDraftBox(null);
    setIsDrawing(false);
    setDragStart(null);
  };

  const handleAutoRedact = async () => {
    if (!imageSrc) return;

    setIsAutoRedacting(true);
    setAutoRedactionError("");

    try {
      const image = new Image();
      image.src = imageSrc;
      await image.decode();

      const result = await Tesseract.recognize(imageSrc, "eng", {
        logger: () => undefined,
      });

      const words = result?.data?.words ?? [];
      if (!words.length) {
        throw new Error("No readable text was detected in the uploaded image.");
      }

      const imageWidth = image.naturalWidth || 1200;
      const imageHeight = image.naturalHeight || 800;

      const detected: RedactionBox[] = [];
      const lineBuckets = new Map<number, { minX: number; maxX: number; minY: number; maxY: number }>();

      words.forEach((word) => {
        const text = String(word?.text ?? "").trim();
        if (!text || (word?.confidence ?? 0) < 30) return;

        const key = Math.round((word.bbox.y0 + word.bbox.y1) / 2 / 20);
        const existing = lineBuckets.get(key);
        if (existing) {
          existing.minX = Math.min(existing.minX, word.bbox.x0);
          existing.maxX = Math.max(existing.maxX, word.bbox.x1);
          existing.minY = Math.min(existing.minY, word.bbox.y0);
          existing.maxY = Math.max(existing.maxY, word.bbox.y1);
        } else {
          lineBuckets.set(key, {
            minX: word.bbox.x0,
            maxX: word.bbox.x1,
            minY: word.bbox.y0,
            maxY: word.bbox.y1,
          });
        }
      });

      Array.from(lineBuckets.values()).forEach((line) => {
        const normalized = normalizeBox(
          {
            x0: Math.max(0, line.minX),
            y0: Math.max(0, line.minY),
            x1: Math.min(imageWidth, line.maxX),
            y1: Math.min(imageHeight, line.maxY),
          },
          imageWidth,
          imageHeight
        );

        if (normalized.width > 2 && normalized.height > 2) {
          detected.push(normalized);
        }
      });

      if (!detected.length) {
        throw new Error("Text detection produced empty regions for redaction.");
      }

      setBoxes(detected);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Auto-redaction failed.";
      setAutoRedactionError(message);
    } finally {
      setIsAutoRedacting(false);
    }
  };

  const exportRedactedImage = async () => {
    if (!imageSrc) return;

    const image = new Image();
    image.src = imageSrc;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || imageMeta.width;
    canvas.height = image.naturalHeight || imageMeta.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.font = "bold 26px sans-serif";

    boxes.forEach((box) => {
      const x = (box.x / 100) * canvas.width;
      const y = (box.y / 100) * canvas.height;
      const width = (box.width / 100) * canvas.width;
      const height = (box.height / 100) * canvas.height;

      ctx.filter = `blur(${blurRadius}px)`;
      ctx.fillRect(x, y, width, height);
      ctx.filter = "none";
      ctx.strokeRect(x, y, width, height);
    });

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(watermark, 30, canvas.height - 28);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value as Blob), "image/png"));
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "codeglow-redacted.png";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <AdBanner
          label="Google AdSense 728x90 Leaderboard"
          className="mx-auto max-w-3xl"
          slot={getAdSlot("redactor")}
        />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/30">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/80">Client-side privacy</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Redactor</h1>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0b1322]/90 p-5">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-400/60 bg-violet-500/5 px-4 py-4 text-base font-medium text-violet-100 transition hover:bg-violet-500/10">
                <ImagePlus className="h-4 w-4" />
                Upload image or document
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handleFileSelect(event.target.files?.[0] || null)}
                />
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-200">Watermark</label>
                <input
                  value={watermark}
                  onChange={(event) => setWatermark(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1a2d] px-3 py-2.5 text-base text-zinc-100 outline-none focus:border-violet-400/80"
                  placeholder="CONFIDENTIAL"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-zinc-300">
                  <label className="font-medium">Blur strength</label>
                  <span>{blurRadius}px</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={40}
                  value={blurRadius}
                  onChange={(event) => setBlurRadius(Number(event.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <button
                type="button"
                onClick={() => void handleAutoRedact()}
                disabled={!imageSrc || isAutoRedacting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Wand2 className="h-4 w-4" />
                {isAutoRedacting ? "Detecting text..." : "Smart auto redact"}
              </button>

              <button
                type="button"
                onClick={exportRedactedImage}
                disabled={!imageSrc}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export redacted image
              </button>

              {autoRedactionError ? <p className="text-sm text-red-400">{autoRedactionError}</p> : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0b1322]/90 p-4 sm:p-5">
              <div
                ref={containerRef}
                className="relative flex h-[620px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_rgba(15,23,42,0.92)_60%,_rgba(2,6,23,0.98)_100%)] select-none"
                style={{ cursor: isDrawing ? "crosshair" : "default", touchAction: "none" }}
                onMouseDown={(event) => {
                  if (event.button !== 0) return;
                  beginSelection(event.clientX, event.clientY);
                }}
                onMouseMove={(event) => isDrawing && updateSelection(event.clientX, event.clientY)}
                onMouseUp={finishSelection}
                onMouseLeave={finishSelection}
                onDragStart={(event) => event.preventDefault()}
              >
                {imageSrc ? (
                  <>
                    <img
                      src={imageSrc}
                      alt="Upload preview"
                      draggable={false}
                      onDragStart={(event) => event.preventDefault()}
                      className="h-full w-full object-contain select-none"
                    />

                    {boxes.map((box, index) => (
                      <div
                        key={`${box.x}-${box.y}-${index}`}
                        className="pointer-events-none absolute rounded-md border-2 border-white/90 bg-black/60 shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.width}%`,
                          height: `${box.height}%`,
                          backdropFilter: `blur(${blurRadius}px)`,
                        }}
                      />
                    ))}

                    {draftBox ? (
                      <div
                        className="pointer-events-none absolute rounded-md border-2 border-dashed border-white/90 bg-white/10"
                        style={{
                          left: `${draftBox.x}%`,
                          top: `${draftBox.y}%`,
                          width: `${draftBox.width}%`,
                          height: `${draftBox.height}%`,
                        }}
                      />
                    ) : null}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-zinc-400">
                    <Sparkles className="h-10 w-10 text-violet-300" />
                    <p className="text-base font-medium text-zinc-200 sm:text-lg">Upload an image to begin redacting.</p>
                  </div>
                )}
              </div>

              <p className="mt-3 text-sm text-zinc-400 sm:text-base">
                Drag to manually mark any sensitive area, or use Smart auto redact to detect text and blur it locally in the browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
