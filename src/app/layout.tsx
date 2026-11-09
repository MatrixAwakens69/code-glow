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
  applicationName: "CodeGlow",
  title: {
    default: "CodeGlow | SVG Playground & AI SVG Generator | CSS Playground & AI Tailwind Generator",
    template: "%s | CodeGlow",
  },
  description:
    "CodeGlow is an AI-powered SVG playground, CSS playground, and Tailwind generator for creating UI mockups, icons, and vector artwork in the browser.",
  keywords: [
    "SVG playground",
    "AI SVG generator",
    "SVG generator online",
    "prompt to SVG",
    "svg creator",
    "CSS playground",
    "Tailwind CSS playground",
    "AI Tailwind generator",
    "Tailwind CSS generator",
    "Tailwind component generator",
    "UI prototype tool",
    "AI design tool",
    "CodeGlow",
    "image redactor",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
    title: "CodeGlow | SVG Playground & AI SVG Generator | CSS Playground & AI Tailwind Generator",
    description:
      "Generate SVG art from prompts, prototype Tailwind UI components, and experiment with CSS in a fast browser-first workflow.",
    url: siteUrl,
    siteName: "CodeGlow",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "CodeGlow SVG playground and CSS playground",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeGlow | SVG Playground & AI SVG Generator | CSS Playground & AI Tailwind Generator",
    description:
      "Create SVGs, test Tailwind CSS ideas, and prototype interfaces faster with CodeGlow.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
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
