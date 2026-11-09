import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CSS Playground & AI Tailwind Generator",
  description:
    "Generate Tailwind UI snippets from prompts and preview them instantly in-browser for landing pages and product mockups.",
  keywords: [
    "CSS playground",
    "Tailwind CSS playground",
    "AI Tailwind generator",
    "Tailwind component generator",
    "Tailwind CSS generator",
    "UI prototype tool",
  ],
  openGraph: {
    title: "CSS Playground & AI Tailwind Generator | CodeGlow",
    description:
      "Generate Tailwind CSS UI components from prompts and preview polished mockups in real time.",
    url: "https://codeglow.app/tailwind-ui",
    siteName: "CodeGlow",
    type: "website",
  },
};

export default function TailwindLayout({ children }: { children: ReactNode }) {
  return children;
}
