import { NextRequest, NextResponse } from "next/server";

function isTailwindPromptAllowed(prompt: string) {
  const lower = prompt.toLowerCase();

  const explicitNonHtmlCodeRequest = /(generate|write|create|build|show|make).{0,80}\b(python|javascript|typescript|java|cpp|c\+\+|rust|go|swift|kotlin|php|ruby|sql|bash|shell|yaml|json)\b.{0,80}\b(code|script|program|function|class|app|page)\b/i;
  const explicitSvgImageRequest = /(generate|write|create|build|make).{0,80}\b(svg|vector|illustration|logo|icon|image|banner|poster|chart|diagram|gif|png|jpg|jpeg|webp)\b.{0,80}\b(code|file|artwork|design)\b/i;
  const explicitHtmlCodeFence = /<\s*(svg|script|style)|```\s*(svg|js|ts|tsx|jsx|py|cpp|java|html)/i;

  return !explicitNonHtmlCodeRequest.test(lower) && !explicitSvgImageRequest.test(lower) && !explicitHtmlCodeFence.test(lower);
}

function buildTailwindSystemPrompt() {
  return [
    "You are a senior front-end UI generator.",
    "This tool is strictly for generating HTML with Tailwind CSS classes only.",
    "Return only one compact Tailwind HTML component that matches the user's prompt exactly.",
    "Do not output raw SVG, plain CSS, JavaScript, React code, or non-HTML markup.",
    "Prioritize the literal visual requirements from the prompt: color palette, background, button styles, text content, emphasis, and hierarchy.",
    "If the prompt specifies a color like red-blue gradient, use that color direction in the CTA/button or primary accent; do not invent a neutral or unrelated palette.",
    "If the prompt specifies specific text, keep it close to that wording instead of rewriting it into a generic marketing copy.",
    "If the prompt explicitly mentions a color, that color must appear in the generated component. Do not default to the app's purple/violet design system unless the prompt explicitly requests it.",
    "Do not add page-level wrappers, navbars, sidebars, footers, or extra sections unless explicitly requested.",
    "Do not output markdown fences, explanations, comments, or duplicate elements.",
    "Keep the component compact and elegant: one focused card or panel, not a full page or long scrolling layout.",
    "Avoid full-height layouts like min-h-screen, h-screen, min-h-[100vh], giant spacing, or tall vertical blocks.",
    "Use realistic spacing and a clear hierarchy, but stay inside a single, polished component preview sized for ~420px width.",
    "If a prompt mentions a CTA/button, make sure that button visually reflects the requested palette and is prominent without introducing unrelated elements."
  ].join(" ");
}

function normalizeHtml(raw: string) {
  const cleaned = raw.trim().replace(/```html/gi, "").replace(/```/g, "").trim();
  if (!cleaned) return "";
  const match = cleaned.match(/<\w+[\s\S]*>/i);
  return match ? cleaned : `<div class="rounded-2xl border border-white/10 bg-white/5 p-6">${cleaned}</div>`;
}

function applyPromptColorOverrides(markup: string, prompt: string) {
  const lower = prompt.toLowerCase();
  const safeMarkup = normalizeHtml(markup);

  if (!safeMarkup) return safeMarkup;

  const red = /red|crimson|scarlet|ruby|rose/.test(lower);
  const blue = /blue|azure|navy|cobalt|indigo/.test(lower);
  const green = /green|emerald|lime/.test(lower);
  const orange = /orange|amber|gold|yellow/.test(lower);
  const black = /black|charcoal|midnight/.test(lower);
  const white = /white|ivory|off-white/.test(lower);

  let result = safeMarkup;

  if (red && blue) {
    result = result
      .replace(/bg-violet-[0-9]+/g, "bg-red-500")
      .replace(/from-violet-[0-9]+/g, "from-red-500")
      .replace(/via-violet-[0-9]+/g, "via-blue-500")
      .replace(/to-violet-[0-9]+/g, "to-blue-600")
      .replace(/bg-indigo-[0-9]+/g, "bg-blue-500")
      .replace(/from-indigo-[0-9]+/g, "from-red-500")
      .replace(/via-indigo-[0-9]+/g, "via-blue-500")
      .replace(/to-indigo-[0-9]+/g, "to-blue-600")
      .replace(/border-violet-[0-9]+/g, "border-red-400")
      .replace(/text-violet-[0-9]+/g, "text-red-100")
      .replace(/shadow-violet-[0-9]+/g, "shadow-red-500/30");
  }

  if (red && !blue) {
    result = result
      .replace(/bg-violet-[0-9]+/g, "bg-red-500")
      .replace(/from-violet-[0-9]+/g, "from-red-500")
      .replace(/via-violet-[0-9]+/g, "via-red-400")
      .replace(/to-violet-[0-9]+/g, "to-red-700")
      .replace(/bg-indigo-[0-9]+/g, "bg-red-500")
      .replace(/text-violet-[0-9]+/g, "text-red-100");
  }

  if (blue && !red) {
    result = result
      .replace(/bg-violet-[0-9]+/g, "bg-blue-500")
      .replace(/from-violet-[0-9]+/g, "from-blue-500")
      .replace(/via-violet-[0-9]+/g, "via-blue-400")
      .replace(/to-violet-[0-9]+/g, "to-cyan-600")
      .replace(/bg-indigo-[0-9]+/g, "bg-blue-500")
      .replace(/text-violet-[0-9]+/g, "text-blue-100");
  }

  if (green) {
    result = result
      .replace(/bg-violet-[0-9]+/g, "bg-emerald-500")
      .replace(/from-violet-[0-9]+/g, "from-emerald-500")
      .replace(/via-violet-[0-9]+/g, "via-green-400")
      .replace(/to-violet-[0-9]+/g, "to-teal-600");
  }

  if (orange) {
    result = result
      .replace(/bg-violet-[0-9]+/g, "bg-orange-500")
      .replace(/from-violet-[0-9]+/g, "from-orange-500")
      .replace(/via-violet-[0-9]+/g, "via-amber-400")
      .replace(/to-violet-[0-9]+/g, "to-yellow-500");
  }

  if (black && white) {
    result = result
      .replace(/bg-slate-[0-9]+/g, "bg-black")
      .replace(/bg-[#0-9A-Fa-f]+/g, "bg-[#020617]")
      .replace(/text-zinc-[0-9]+/g, "text-white")
      .replace(/text-slate-[0-9]+/g, "text-white");
  }

  return result;
}

function buildFallbackHtml(prompt: string) {
  const label = prompt.slice(0, 36).replace(/[<>]/g, "") || "Launch";

  return `
    <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/20 via-slate-900/80 to-sky-500/10 p-8 shadow-2xl shadow-violet-500/20">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-[10px] uppercase tracking-[0.28em] text-violet-200">Launch</p>
          <h2 class="mt-2 text-3xl font-bold text-white">${label}</h2>
        </div>
        <button class="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/30">Open</button>
      </div>
    </div>
  `.trim();
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
              text: `${buildTailwindSystemPrompt()} User request: ${prompt}`,
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
  return applyPromptColorOverrides(text, prompt);
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
      max_tokens: 8000,
      system: buildTailwindSystemPrompt(),
      messages: [{ role: "user", content: `Create the requested component: ${prompt}` }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic Tailwind request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const text = extractAnthropicText(payload);
  if (!text) return null;
  return applyPromptColorOverrides(text, prompt);
}

async function generateWithConfiguredProvider(prompt: string) {
  const provider = (process.env.TAILWIND_PROVIDER || process.env.AI_PROVIDER || process.env.SVG_PROVIDER || "").toLowerCase();

  if (provider === "gemini") return generateWithGemini(prompt);
  if (provider === "anthropic") return generateWithAnthropic(prompt);
  if (provider === "ollama") return null;

  return generateWithGemini(prompt) ?? generateWithAnthropic(prompt) ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
    }

    if (!isTailwindPromptAllowed(prompt)) {
      return NextResponse.json({
        error: "This Tailwind playground only accepts prompts for generating HTML UI components with Tailwind CSS classes. Please provide a UI/HTML-focused prompt only.",
      }, { status: 400 });
    }

    const provider = (process.env.TAILWIND_PROVIDER || process.env.AI_PROVIDER || process.env.SVG_PROVIDER || "").toLowerCase();
    const html = await generateWithConfiguredProvider(prompt);

    if (html) {
      return NextResponse.json({ html, provider: provider || "auto" });
    }

    if (provider) {
      return NextResponse.json({
        error: `The configured provider (${provider}) failed to generate valid HTML. Check the model name, API key, and network connectivity.`,
      }, { status: 502 });
    }

    return NextResponse.json({ html: buildFallbackHtml(prompt), provider: "fallback" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate HTML.";
    const provider = (process.env.TAILWIND_PROVIDER || process.env.AI_PROVIDER || process.env.SVG_PROVIDER || "").toLowerCase();

    if (provider) {
      return NextResponse.json({ error: message, provider }, { status: 502 });
    }

    return NextResponse.json({ error: message, provider: "fallback" }, { status: 500 });
  }
}
