import { NextRequest, NextResponse } from "next/server";

const MAX_GENERATED_LINES = 1000;

function limitGeneratedLines(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const lines = trimmed.split(/\r?\n/);
  if (lines.length <= MAX_GENERATED_LINES) return trimmed;

  return lines.slice(0, MAX_GENERATED_LINES).join("\n");
}

function normalizeSvg(raw: string) {
  const cleaned = raw.trim().replace(/```svg/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
  const svg = match ? match[0] : cleaned;

  if (!svg) return "";
  if (svg.startsWith("<svg")) return limitGeneratedLines(svg);

  return limitGeneratedLines(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">${svg}</svg>`);
}

function isSvgPromptAllowed(prompt: string) {
  const lower = prompt.toLowerCase();

  const explicitNonSvgCodeRequest = /(generate|write|create|build|show|make).{0,80}\b(python|javascript|typescript|java|cpp|c\+\+|html|css|tailwind|react|next|vue|json|yaml|sql|bash|shell|php|ruby|swift|kotlin|go|rust)\b.{0,80}\b(code|program|script|component|function|class|page|app)\b/i;
  const explicitHtmlTagRequest = /<\s*(html|body|div|script|style|svg)|```\s*(html|js|ts|tsx|jsx|py|cpp|java)/i;
  const explicitSvgForbiddenRequest = /\b(generate|write|create|build|make).{0,80}\b(component|page|app|website|dashboard|auth|login|form)\b.{0,80}\b(in|with)?\s*(html|css|tailwind|react|next|javascript|typescript)\b/i;

  return !explicitNonSvgCodeRequest.test(lower) && !explicitHtmlTagRequest.test(lower) && !explicitSvgForbiddenRequest.test(lower);
}

function getSvgSystemPrompt() {
  return [
    "You are a senior SVG illustrator.",
    "This tool is strictly for generating SVG code only.",
    "Return only valid SVG markup with a real vector composition, useful shapes, gradients, and balanced layout.",
    "CRITICAL: the generated SVG code must be under 1000 lines total. Keep the SVG concise, clean, and optimized.",
    "Do not produce HTML, CSS, JavaScript, React components, or any non-SVG output.",
    "Do not output placeholder mockups, whiteboard checkboxes, or generic card layouts.",
    "The SVG should look intentionally designed and visually rich, not like a blank template or a generic icon.",
    "Use a realistic 1200x800 canvas with gradients, circles, curves, and precise geometric elements as needed.",
    "If the prompt is asking for non-SVG code, reject it and respond with a clear refusal instead of generating anything else.",
    "No markdown, no code fences, no commentary, no explanation."
  ].join(" ");
}

function buildFallbackSvg(prompt: string) {
  const text = prompt.slice(0, 60).replace(/[<>&"']/g, "");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${text}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" rx="44"/>
      <circle cx="926" cy="205" r="160" fill="rgba(255,255,255,0.14)"/>
      <circle cx="290" cy="630" r="210" fill="rgba(255,255,255,0.08)"/>
      <rect x="182" y="160" width="760" height="420" rx="36" fill="rgba(15,23,42,0.38)" stroke="rgba(255,255,255,0.2)"/>
      <rect x="240" y="220" width="220" height="22" rx="11" fill="rgba(255,255,255,0.18)"/>
      <rect x="240" y="268" width="300" height="18" rx="9" fill="rgba(255,255,255,0.11)"/>
      <circle cx="640" cy="416" r="90" fill="rgba(255,255,255,0.1)"/>
      <path d="M580 416 L620 458 L720 338" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="600" y="618" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="44" font-family="Arial, sans-serif" font-weight="700">${text || "CodeGlow"}</text>
    </svg>
  `.trim();
}

async function generateWithGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{
              text: `${getSvgSystemPrompt()} Prompt: ${prompt}`,
            }],
          },
        ],
      }),
    }
  );

  if (!response.ok) return null;
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") return null;

  return normalizeSvg(text);
}

function extractAnthropicText(payload: any): string {
  const content = payload?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const textParts: string[] = [];

    for (const item of content) {
      if (!item) continue;

      if (typeof item?.text === "string" && item.text.trim()) {
        textParts.push(item.text.trim());
      }

      if (Array.isArray(item?.content)) {
        for (const nested of item.content) {
          if (nested && typeof nested?.text === "string" && nested.text.trim()) {
            textParts.push(nested.text.trim());
          }
        }
      }
    }

    const combined = textParts.join("\n").trim();
    if (combined) return combined;
  }

  if (typeof payload?.output_text === "string") {
    return payload.output_text.trim();
  }

  return "";
}

async function generateWithAnthropic(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: getSvgSystemPrompt(),
      messages: [{ role: "user", content: `Generate a clean SVG illustration for: ${prompt}` }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic SVG request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const text = extractAnthropicText(payload);
  if (!text) return null;

  return normalizeSvg(text);
}

async function generateSvgWithConfiguredProvider(prompt: string) {
  const provider = (process.env.SVG_PROVIDER || process.env.AI_PROVIDER || "").toLowerCase();

  if (provider === "gemini") return generateWithGemini(prompt);
  if (provider === "anthropic") return generateWithAnthropic(prompt);
  if (provider === "ollama") return generateWithOllama(prompt);

  return generateWithGemini(prompt) ?? generateWithAnthropic(prompt) ?? null;
}

async function generateWithOllama(prompt: string) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${getSvgSystemPrompt()} Prompt: ${prompt}`,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama SVG request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const text = typeof payload?.response === "string" ? payload.response : "";
  return normalizeSvg(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
    }

    if (!isSvgPromptAllowed(prompt)) {
      return NextResponse.json({
        error: "This SVG generator only accepts prompts for creating SVG artwork, icons, illustrations, or vector shapes. Please provide an SVG-focused prompt only.",
      }, { status: 400 });
    }

    const provider = (process.env.SVG_PROVIDER || process.env.AI_PROVIDER || "").toLowerCase();
    const svg = await generateSvgWithConfiguredProvider(prompt);

    if (svg) {
      return NextResponse.json({ svg, provider: provider || "auto" });
    }

    if (provider) {
      return NextResponse.json({
        error: `The configured provider (${provider}) failed to generate a valid SVG. Check the model name, API key, and network connectivity.`,
      }, { status: 502 });
    }

    return NextResponse.json({ svg: buildFallbackSvg(prompt), provider: "fallback" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate SVG.";
    const provider = (process.env.SVG_PROVIDER || process.env.AI_PROVIDER || "").toLowerCase();

    if (provider) {
      return NextResponse.json({ error: message, provider }, { status: 502 });
    }

    return NextResponse.json({ error: message, provider: "fallback" }, { status: 500 });
  }
}
