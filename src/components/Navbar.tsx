import Link from "next/link";
import { Sparkles } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/svg-generator", label: "SVG Generator" },
  { href: "/redactor", label: "Redactor" },
  { href: "/tailwind-ui", label: "Tailwind UI" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">CodeGlow</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/svg-generator"
          className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400"
        >
          Launch App
        </Link>
      </div>
    </header>
  );
}
