import Link from "next/link";
import { ArrowRight, Palette, Sparkles } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

const tools = [
  {
    title: "Code to Image",
    description: "Generate polished code screenshots with social-ready aspect ratios, syntax highlighting, and export controls built for sharing.",
    href: "/code-to-image",
    icon: Palette,
    accent: "from-violet-500 to-purple-500",
  },
  {
    title: "SVG Generator",
    description: "Prompt an AI model to generate SVG artwork, preview it instantly, and download clean vector assets in-browser.",
    href: "/svg-generator",
    icon: Sparkles,
    accent: "from-amber-500 to-orange-500",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-zinc-100">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-6">
            <AdBanner label="Google AdSense 728x90 Leaderboard" className="mx-auto max-w-3xl" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-violet-200">
                Developer utility tools
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Turn code and prompts into polished, shareable assets.
              </h1>
              <p className="mt-4 max-w-xl text-base text-zinc-300">
                CodeGlow focuses on the products that matter most for growth and monetization: high-quality code screenshots and AI-powered SVG generation.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/code-to-image"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400"
                >
                  Launch Code to Image
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/svg-generator"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-5 py-3 text-sm font-medium text-zinc-100 transition hover:border-violet-400/60 hover:text-white"
                >
                  Explore SVG Generator
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="space-y-4">
                {[
                  { label: "Built for", value: "Developers & creators" },
                  { label: "AI output", value: "Prompt-to-SVG" },
                  { label: "Export quality", value: "PNG, JPEG & SVG" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link key={tool.href} href={tool.href} className="group block rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-400/50 hover:bg-white/7">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.accent}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">{tool.title}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{tool.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-200">
                  Open tool
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
