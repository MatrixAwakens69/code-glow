import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Image Redactor",
  description:
    "Redact sensitive text and personal details from screenshots and documents in-browser without sending files to a server.",
};

export default function RedactorLayout({ children }: { children: ReactNode }) {
  return children;
}
