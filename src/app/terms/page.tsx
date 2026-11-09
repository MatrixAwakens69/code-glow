import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-5 py-12 text-zinc-100 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-200">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Terms of Service</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-300">
          <p>CodeGlow provides developer utility tools for learning, experimentation, and productivity. These tools are provided as-is, without warranty.</p>
          <p>You are responsible for the content you generate, copy, upload, or export using CodeGlow. Do not upload or process sensitive data in ways that violate compliance obligations or applicable law.</p>
          <p>We may update features, pricing, policies, or ad placement without notice. Continued use of the product constitutes acceptance of any policy changes.</p>
          <p>We comply with general advertising and platform policies by avoiding deceptive ad placement, intrusive layouts, click-jacking, fake engagement, or incentivized clicking. Ads are clearly labeled as advertisements, visually separated from core actions, and placed in non-manipulative positions.</p>
          <p>Users are prohibited from abusing the system, scraping or overloading the service, misleading users about ads, or attempting to exploit the AI generation routes. Prohibited content includes illegal, deceptive, harmful, explicit, scam-like, or policy-violating subject matter.</p>
          <p>For questions, email hello@codeglow.app.</p>
        </div>

        <div className="mt-8">
          <Link href="/privacy" className="text-violet-300 underline-offset-4 hover:underline">Read Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}
