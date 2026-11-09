import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { hasAnyValidAdSenseSlot, isValidAdSenseClientId } from "@/lib/ads";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = "https://codeglow.app";
const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
const shouldLoadAdsenseScript = isValidAdSenseClientId(adsenseClientId) && hasAnyValidAdSenseSlot();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CodeGlow | AI SVG Generator, Redactor & Tailwind UI Tools",
    template: "%s | CodeGlow",
  },
  description:
    "CodeGlow helps developers generate SVG art from prompts, redact sensitive content locally in-browser, and prototype Tailwind UI ideas faster with AI-powered tools.",
  keywords: [
    "AI SVG generator",
    "SVG generator",
    "developer tools",
    "Tailwind UI generator",
    "image redactor",
    "privacy-safe editor",
    "CodeGlow",
    "prompt to SVG",
    "AI design tools",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "CodeGlow" }],
  creator: "CodeGlow",
  publisher: "CodeGlow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "CodeGlow | AI SVG Generator, Redactor & Tailwind UI Tools",
    description:
      "Browser-first developer utilities for creating SVGs, redacting sensitive content, and prototyping Tailwind interfaces with AI.",
    url: siteUrl,
    siteName: "CodeGlow",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "CodeGlow developer utility platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeGlow",
    description:
      "Generate SVGs, redact sensitive content, and prototype Tailwind UIs in a fast, privacy-first workflow.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <head>
        {shouldLoadAdsenseScript ? (
          <>
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
              strategy="afterInteractive"
              data-ad-client={adsenseClientId}
            />
            <Script id="adsense-init" strategy="afterInteractive">
              {`(window.adsbygoogle = window.adsbygoogle || []).push({});`}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-full bg-[#070b14] text-zinc-100">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
