<<<<<<< HEAD
<<<<<<< HEAD
"use client";
import AuthForm from "./components/login";
import { useState } from 'react';
=======

>>>>>>> 4d8430d (added basic middleware for passing path, basic landing page implemented)

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
=======
'use client'

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

>>>>>>> dcd573d (implemented landing page redirect to chatbot page)
  return (
<<<<<<< HEAD
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      MAIN PAGE
      <AuthForm setToken={setToken} />
=======
    <div className="grid flex flex-col pt-[100] place-content-center">
        <div className="relative text-5xl w-fit mx-auto">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 -mx-4 bg-[#E9F3DA]"></div>
          <div className="relative text-7xl">ADVISORY</div>
        </div>
        <div className="text-md text-center m-2">A Personal AI Tutor.</div>
          {/* Input Box */}
        <div className="relative flex flex-row w-[60vw] p-4 border-none rounded-full bg-[#FFF0D2]">
            {/* Input Field */}
            <input
              className="bg-transparent w-full focus:outline-none"
              type="text"
              placeholder="As me something..."
              // value={input}
              // onChange={(e) => setInput(e.target.value)}
              onKeyDown={ (e) => e.key === "Enter" && router.push(`/chatbot?course=CSC207&query=${(e.target as HTMLTextAreaElement).value}`) }
            />
            {/* Send Button (Inside Input) */}
            <button className="text-3xl ml-3 text-gray-500">➤</button>
        </div>
>>>>>>> 4d8430d (added basic middleware for passing path, basic landing page implemented)
    </div>
  );
}
