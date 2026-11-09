import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SVG Playground & AI SVG Generator",
  description:
    "Generate clean SVG artwork from a text prompt and export the result for branding, icons, and creative mockups.",
  keywords: [
    "SVG playground",
    "AI SVG generator",
    "SVG generator online",
    "prompt to SVG",
    "SVG creator",
    "logo generator",
    "icon generator",
  ],
  openGraph: {
    title: "SVG Playground & AI SVG Generator | CodeGlow",
    description:
      "Create polished SVG art and vector icons from natural-language prompts with CodeGlow's browser-based generator.",
    url: "https://codeglow.app/svg-generator",
    siteName: "CodeGlow",
    type: "website",
  },
};

export default function SvgGeneratorLayout({ children }: { children: ReactNode }) {
  return children;
}
