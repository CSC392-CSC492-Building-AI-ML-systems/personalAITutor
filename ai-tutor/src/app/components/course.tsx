"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

type Course = {
  id: number;
  name: string;
};

type CourseProps = {
  enrolledCourses: Course[];
  availableCourses: Course[];
  onEnroll: (course: Course) => void;
  onUnenroll: (course: Course) => void;
};

export default function Course({ enrolledCourses, availableCourses, onEnroll, onUnenroll }: CourseProps) {
  return (
    <div className="flex gap-8 p-4">
      {/* Enrolled Courses Section */}
      <Card className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4"> Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <ul className="space-y-2">
            {enrolledCourses.map((course) => (
              <li key={course.id} className="flex justify-between items-center p-2 border rounded">
                <span>{course.name}</span>
                <Button
                className="bg-[#FFF0D2] text-black border hover:bg-[#FFE0A3]"
                onClick={() => onUnenroll(course)}
                >
                ➖
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You are not enrolled in any courses.</p>
        )}
      </Card>

      {/* Available Courses Section */}
      <Card className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Available Courses</h2>
        {availableCourses.length > 0 ? (
          <ul className="space-y-2">
            {availableCourses.map((course) => (
              <li key={course.id} className="flex justify-between items-center p-2 border rounded">
                <span>{course.name}</span>
                <Button
                className="bg-[#FFF0D2] text-black border hover:bg-[#FFE0A3]"
                onClick={() => onEnroll(course)}
                >
                ➕
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No courses available to enroll.</p>
        )}
      </Card>
    </div>
  );
}
