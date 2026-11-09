import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tailwind UI Playground",
  description:
    "Generate Tailwind UI snippets from prompts and preview them instantly in-browser for landing pages and product mockups.",
};

export default function TailwindLayout({ children }: { children: ReactNode }) {
  return children;
}
