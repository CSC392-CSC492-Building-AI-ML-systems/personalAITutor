import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import Course from "./course"; // Import Course component

type User = {
  name?: string;
  email?: string;
  password?: string;
  isLoggedIn: boolean;
};

type CourseType = {
  id: number;
  name: string;
};

// Dummy Course Data
const allCourses: CourseType[] = [
  { id: 1, name: "CSC207" },
  { id: 2, name: "CSC311" },
  { id: 3, name: "CSC209" },
];

export default function Profile({ user, onClose }: { user: User; onClose: () => void }) {
  const [showCourses, setShowCourses] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // Track if signing up

  // State for enrolled & available courses
  const [enrolledCourses, setEnrolledCourses] = useState<CourseType[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseType[]>(allCourses);

  // Enroll in a course
  const handleEnroll = (course: CourseType) => {
    setEnrolledCourses([...enrolledCourses, course]);
    setAvailableCourses(availableCourses.filter((c) => c.id !== course.id));
  };

  // Unenroll from a course
  const handleUnenroll = (course: CourseType) => {
    setAvailableCourses([...availableCourses, course]);
    setEnrolledCourses(enrolledCourses.filter((c) => c.id !== course.id));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-6 rounded-lg bg-[#E9F3DA] max-w-3xl w-full">
        <DialogTitle>{user.isLoggedIn ? "Profile" : isSigningUp ? "Sign Up" : "Login"}</DialogTitle>

        {user.isLoggedIn ? (
          // Logged-in User View
          <div className="space-y-4">
            <Input type="text" defaultValue={user.name} placeholder="User Name" />
            <Input type="email" defaultValue={user.email} placeholder="Email" />
            <Input type="password" defaultValue={user.password} placeholder="Password" />

            {/* Courses Button */}
            <Button
              className="bg-[#FFF0D2] text-black border hover:bg-[#FFE0A3]"
              onClick={() => setShowCourses(!showCourses)}
            >
              Courses
            </Button>

            {/* Show Course Component when button is clicked */}
            {showCourses && (
              <Course
                enrolledCourses={enrolledCourses}
                availableCourses={availableCourses}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
              />
            )}
          </div>
        ) : (
          // Login or Sign Up View
          <div className="space-y-4">
            {isSigningUp ? (
              <>
                <Input type="text" placeholder="Username" />
                <Input type="email" placeholder="Email" />
                <Input type="password" placeholder="Password" />
                <Button className="w-full">Sign Up</Button>
                <p className="text-center text-sm">
                  Already have an account?{" "}
                  <span 
                    className="text-blue-500 cursor-pointer" 
                    onClick={() => setIsSigningUp(false)}
                  >
                    Login
                  </span>
                </p>
              </>
            ) : (
              <>
                <Input type="email" placeholder="Email" />
                <Input type="password" placeholder="Password" />
                <Button className="w-full">Login</Button>
                <p className="text-center text-sm">
                  Don't have an account yet?{" "}
                  <span 
                    className="text-blue-500 cursor-pointer" 
                    onClick={() => setIsSigningUp(true)}
                  >
                    Sign Up
                  </span>
                </p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
