import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoopStep — Calm Adaptive Python Loop Tutor (24b3007)",
  description:
    "Adaptive educational tutor for Class 10 CBSE Python Loops. Roll No: 24b3007. Exam Card: P4-T10-L5-C4.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAF8F5] text-[#1C1917] min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
