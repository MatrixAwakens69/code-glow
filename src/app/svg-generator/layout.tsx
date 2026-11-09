import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI SVG Generator",
  description:
    "Generate clean SVG artwork from a text prompt and export the result for branding, icons, and creative mockups.",
};

export default function SvgGeneratorLayout({ children }: { children: ReactNode }) {
  return children;
}
