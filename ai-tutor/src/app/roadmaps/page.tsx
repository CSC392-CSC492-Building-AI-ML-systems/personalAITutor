'use client'

import { useState, useEffect } from "react";

export default function Roadmaps() {

  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("http://localhost:3000/api/courses");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data: string[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div>
      <div>Roadmaps</div>
      <div>

      </div>

    </div>
  );
}
