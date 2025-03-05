import type { Metadata } from "next";
import Link from 'next/link';
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Advisory",
  description: "A Personal AI Tutor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-full `}>
        <Link href="/">
        </Link>
        <Link href="/roadmaps">Roadmaps</Link>
        <Link href="/chatbot">Chatbot</Link>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
