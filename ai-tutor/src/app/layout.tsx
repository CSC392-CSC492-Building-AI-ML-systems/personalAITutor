import type { Metadata } from "next";
import Link from 'next/link';
import Image from "next/image";
import "./globals.css";


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
    <html lang="en">
<body className={`font-mono h-screen antialiased flex flex-col`}>
  {/* Header */}
  <div className="border-b flex flex-none flex-row h-1/10 items-center">
    <Link href="/">
      <Image className="m-3" src="logo.svg" alt="advisory logo" width={80} height={80}></Image>
    </Link>
    <Link href="/roadmaps" className="ml-4">Roadmaps</Link>
    <Link href="/chatbot" className="ml-4">Chatbot</Link>
  </div>
  {/* Main content */}
  <main className="flex-1 overflow-auto">
    {children}
  </main>

  {/* Footer */}
  <div className="border-t flex-none h-1/10 text-center">
    Terms of service
  </div>
</body>
    </html>
  );
}
