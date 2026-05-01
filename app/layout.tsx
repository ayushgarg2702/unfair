import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unfair Website",
  description: "Because she is always right.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
