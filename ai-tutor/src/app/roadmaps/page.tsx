"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { getAllCourses } from "@/utils/courseUtils";

interface Course {
  name: string;
  description: string;
  has_chatbot: boolean;
  has_roadmap: boolean;
  code: string;
}

export default function Roadmaps() {

  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getAllCourses();
        const coursesWithRoadmap = data.courses.filter((course: Course) => course.has_roadmap).map((course: Course) => course.code);
        setCourses(coursesWithRoadmap);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="grid pt-[5vh] place-content-center">
      <div className="relative relative w-fit mx-auto">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 -mx-4 bg-[#E9F3DA]"></div>
        <div className="relative text-7xl">ROADMAPS</div>
      </div>
      <div className="w-fit max-w-5xl grid h-100 grid-cols-4 gap-4 pt-10">

        {courses.map((c) => {
          return (
            <Link href={`/roadmaps/${c.toLowerCase()}`} key={c}>
              <div
                className="w-[200px] h-[100px] shadow-sm place-content-center text-center rounded-lg bg-[#FFF0D2] cursor-pointer"
              >
                {c}
              </div>
            </Link>
          );
        })}
        
      </div>
    </div>
  );
}