import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Image Redactor",
  description:
    "Redact sensitive text and personal details from screenshots and documents in-browser without sending files to a server.",
  keywords: [
    "image redactor",
    "privacy-safe editor",
    "blur sensitive content",
    "browser image redactor",
  ],
};

export default function RedactorLayout({ children }: { children: ReactNode }) {
  return children;
}
