import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-5 py-12 text-zinc-100 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-200">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Privacy Policy</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-300">
          <p>CodeGlow is designed as a privacy-first browser utility. We do not require account creation, and most tools run entirely inside the browser.</p>
          <p>When you upload an image in the Redactor tool, the file stays in your local browser session and is not transmitted to our servers unless you choose to share it externally.</p>
          <p>We may use standard analytics and ad serving technology to support product performance and advertising compliance. We do not sell personal data for marketing purposes.</p>
          <p>We use third-party services, including Google AdSense, which is subject to their own privacy practices and policies. Please review those policies directly. Ads are served only on clearly labeled advertisement slots and are never presented as part of a user action, fake content, or deceptive UI element.</p>
          <p>We do not collect sensitive personal information for advertising purposes, and we do not use deceptive consent or hidden tracking practices. If a tool does not require data transfer, we avoid sending it to a server.</p>
          <p>Contact us at hello@codeglow.app for policy questions, data requests, or removal requests.</p>
        </div>

        <div className="mt-8">
          <Link href="/terms" className="text-violet-300 underline-offset-4 hover:underline">Read Terms of Service</Link>
        </div>
      </div>
    </main>
  );
}
