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
import LandingDropdown from "./components/LandingDropdown";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();

<<<<<<< HEAD
>>>>>>> dcd573d (implemented landing page redirect to chatbot page)
=======
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("http://localhost:3000/api/courses");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data: string[] = await res.json();
        setCourses(data);
        setSelectedCourse(data[0]);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }
    fetchCourses();
  }, []);

>>>>>>> 7f05b89 (Implemented course selection for query on landing page)
  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      MAIN PAGE
      <AuthForm setToken={setToken} />
=======
    <div className="grid flex flex-col pt-[100] place-content-center">
=======
    <div className="grid flex flex-col pt-[20vh] place-content-center">
>>>>>>> f973dad (finished roadmaps page)
        <div className="relative text-5xl w-fit mx-auto">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 -mx-4 bg-[#E9F3DA]"></div>
          <div className="relative text-7xl">ADVISORY</div>
        </div>
        <div className="text-md text-center m-2">A Personal AI Tutor.</div>
          {/* Input Box */}
        <div className="text-md relative flex flex-row max-w-7xl w-[60vw] p-3 border-none rounded-full bg-[#FFF0D2]">
            {/* Input Field */}
            <div className="relative inline-flex w-fit ml-4">
              <LandingDropdown availableCourses={courses} currCourse={selectedCourse} selectCourse={setSelectedCourse} />
            </div>
            <div className= "relative flex p-1 text-2xl mb-1 text-gray-400">|</div>
            <input
              className="relative flex bg-transparent w-full focus:outline-none placeholder:text-gray-400"
              type="text"
              placeholder="Ask me something..."
              // value={input}
              // onChange={(e) => setInput(e.target.value)}
              onKeyDown={ (e) => e.key === "Enter" && router.push(`/chatbot?course=${selectedCourse}&query=${(e.target as HTMLTextAreaElement).value}`) }
            />
            {/* Send Button (Inside Input) */}
            <button className="text-3xl ml-3 mr-3 text-gray-400">➤</button>
        </div>
>>>>>>> 4d8430d (added basic middleware for passing path, basic landing page implemented)
    </div>
  );
}
