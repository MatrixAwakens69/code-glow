import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeGlow | AI SVG Generator, Redactor, Tailwind UI & JSON Tools",
  description: "CodeGlow is a privacy-first developer utility platform with AI SVG generation, visual redaction, Tailwind UI generation, and JSON conversion tools.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          strategy="afterInteractive"
          data-ad-client="ca-pub-0000000000000000"
        />
        <Script id="adsense-init" strategy="afterInteractive">
          {`(window.adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </head>
      <body className="min-h-full bg-[#070b14] text-zinc-100">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
