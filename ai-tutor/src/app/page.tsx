'use client'

import { useRouter } from 'next/navigation';
import LandingDropdown from "./components/LandingDropdown";
import { useState, useEffect } from "react";
import { getAllCourses } from "@/utils/courseUtils";

interface Course {
  name: string;
  description: string;
  has_chatbot: boolean;
  has_roadmap: boolean;
  code: string;
}

export default function Home() {
  const router = useRouter();

  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const allCoursesResponse = await getAllCourses();
        const data = allCoursesResponse.courses.map((course: Course) => course.code);
        setCourses(data);
        setSelectedCourse(data[0]);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }
    fetchCourses();
  }, []);

  const handleSend = () => {
    if (selectedCourse && input.trim()) {
      router.push(`/chatbot?course=${selectedCourse}&query=${input}`);
    }
  };

  return (
    <div className="grid flex flex-col pt-[20vh] place-content-center">
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            {/* Send Button (Inside Input) */}
            <button className="text-3xl ml-3 mr-3 text-gray-400" onClick={handleSend}>➤</button>
        </div>
    </div>
  );
}