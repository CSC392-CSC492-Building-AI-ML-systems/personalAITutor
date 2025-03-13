"use client";
import AuthForm from "./components/login";
import { useState } from 'react';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      MAIN PAGE
      <AuthForm setToken={setToken} />
    </div>
  );
}
