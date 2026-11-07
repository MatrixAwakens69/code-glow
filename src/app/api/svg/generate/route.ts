import { NextRequest, NextResponse } from "next/server";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const expanded = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const value = Number.parseInt(expanded, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function escapeSvgAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPaletteFromPrompt(prompt: string) {
  const lower = prompt.toLowerCase();

  const paletteMap: Record<string, [string, string]> = {
    rocket: ["#f97316", "#facc15"],
    ai: ["#7c3aed", "#22d3ee"],
    nature: ["#16a34a", "#84cc16"],
    cyber: ["#2563eb", "#a855f7"],
    startup: ["#f59e0b", "#fb7185"],
    data: ["#14b8a6", "#2dd4bf"],
    abstract: ["#8b5cf6", "#38bdf8"],
    gaming: ["#f43f5e", "#8b5cf6"],
    finance: ["#22c55e", "#0ea5e9"],
    productivity: ["#3b82f6", "#10b981"],
  };

  for (const [keyword, palette] of Object.entries(paletteMap)) {
    if (lower.includes(keyword)) return palette;
  }

  return ["#0f172a", "#22c55e"] as [string, string];
}

function normalizeSvgResponse(raw: string) {
  const cleaned = raw.trim().replace(/```svg/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/<svg[\s\S]*<\/svg>/i);
  const svg = match ? match[0] : cleaned;

  if (!svg) return "";
  if (svg.startsWith("<svg")) return svg;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">${svg}</svg>`;
}

function buildFallbackSvg(prompt: string) {
  const [baseColor, accentColor] = getPaletteFromPrompt(prompt);
  const { r: baseR, g: baseG, b: baseB } = hexToRgb(baseColor);
  const { r: accentR, g: accentG, b: accentB } = hexToRgb(accentColor);

  const safeLabel = escapeSvgAttribute(prompt.slice(0, 60));

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${baseColor}" />
          <stop offset="100%" stop-color="${accentColor}" />
        </linearGradient>
        <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <g filter="url(#blur)" opacity="0.92">
        <circle cx="240" cy="180" r="185" fill="rgba(${accentR}, ${accentG}, ${accentB}, 0.45)" />
        <circle cx="930" cy="230" r="200" fill="rgba(${baseR}, ${baseG}, ${baseB}, 0.44)" />
        <circle cx="640" cy="620" r="210" fill="rgba(${accentR}, ${accentG}, ${accentB}, 0.28)" />
      </g>
      <g transform="translate(280 170)">
        <rect x="0" y="0" width="640" height="420" rx="36" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.2)" />
        <circle cx="118" cy="120" r="48" fill="rgba(255,255,255,0.18)" />
        <rect x="200" y="88" width="300" height="22" rx="11" fill="rgba(255,255,255,0.22)" />
        <rect x="200" y="130" width="220" height="18" rx="9" fill="rgba(255,255,255,0.14)" />
        <rect x="80" y="220" width="480" height="120" rx="24" fill="rgba(255,255,255,0.08)" />
        <path d="M150 290 L250 360 L420 200" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  `.trim();
}

async function generateWithOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) return null;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 1400,
      messages: [
        {
          role: "system",
          content:
            "You are a senior SVG illustrator. Return only valid SVG markup, no markdown fences, no explanation, no code block wrappers. Output a polished SVG illustration sized 1200x800 that matches the user's prompt exactly and is production-ready.",
        },
        {
          role: "user",
          content: `Generate a clean, modern SVG illustration for this prompt: ${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  return normalizeSvgResponse(content);
}

async function generateWithOllama(prompt: string) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: `Generate only valid SVG markup, no markdown fences, no explanation. Use a 1200x800 canvas and match this prompt exactly: ${prompt}`,
      stream: false,
    }),
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const content = typeof payload?.response === "string" ? payload.response : "";
  return normalizeSvgResponse(content);
}

async function generateWithAnthropic(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      system:
        "You are a senior SVG illustrator. Return only valid SVG markup, no markdown fences, no explanation, no surrounding prose. The output must be production-ready SVG that matches the design brief.",
      messages: [{ role: "user", content: `Create a modern SVG illustration for this prompt: ${prompt}` }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const text = payload?.content?.[0]?.text;
  if (typeof text !== "string") return null;

  return normalizeSvgResponse(text);
}

async function generateSvgWithProvider(prompt: string) {
  const provider = (process.env.SVG_PROVIDER || process.env.AI_PROVIDER || "ollama").toLowerCase();

  if (provider === "anthropic") return generateWithAnthropic(prompt);
  if (provider === "openai") return generateWithOpenAI(prompt);
  if (provider === "ollama") return generateWithOllama(prompt);

  return generateWithOllama(prompt) ?? generateWithOpenAI(prompt) ?? generateWithAnthropic(prompt);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
    }

    const provider = (process.env.SVG_PROVIDER || process.env.AI_PROVIDER || "").toLowerCase();
    const generatedSvg = await generateSvgWithProvider(prompt);

    if (generatedSvg) {
      return NextResponse.json({ svg: generatedSvg, provider });
    }

    if (provider) {
      return NextResponse.json({ error: `No SVG generated for provider: ${provider}` }, { status: 502 });
    }

    return NextResponse.json({ svg: buildFallbackSvg(prompt), provider: "fallback" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate SVG.";
    const provider = (process.env.SVG_PROVIDER || process.env.AI_PROVIDER || "").toLowerCase();

    if (provider) {
      return NextResponse.json({ error: message, provider }, { status: 502 });
    }

    return NextResponse.json({ error: message, provider: "fallback" }, { status: 500 });
  }
}
