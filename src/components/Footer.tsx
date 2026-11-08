export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080d1a]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© 2026 CodeGlow. Zero-backend browser tools for developers.</p>

        <div className="flex flex-wrap items-center gap-4">
          <a href="/privacy" className="transition hover:text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="transition hover:text-white">
            Terms of Service
          </a>
          <a href="/contact" className="transition hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
