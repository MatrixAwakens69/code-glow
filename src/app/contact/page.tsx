import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-5 py-12 text-zinc-100 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-200">Support</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Contact</h1>
        <p className="mt-6 text-base text-zinc-300">For product feedback, support, or policy questions, reach out at:</p>
        <a href="mailto:hello@codeglow.app" className="mt-4 inline-block text-lg font-medium text-violet-300">hello@codeglow.app</a>
        <div className="mt-8">
          <Link href="/" className="text-violet-300 underline-offset-4 hover:underline">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
