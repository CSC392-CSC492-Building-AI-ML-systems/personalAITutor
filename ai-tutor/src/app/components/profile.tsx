import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { register, login, logout } from "../utils/authUtils";
import { enrollCourse, dropCourse, getAllCourses, getUserCourses } from "../utils/courseUtils";
import Course from "./course";

type User = {
  name?: string;
  email?: string;
  password?: string;
  isLoggedIn: boolean;
};

type CourseType = {
  code: string;
};

export default function Profile({
  user,
  setUser,
  onClose,
}: {
  user: User;
  setUser;
  onClose: () => void;
}) {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  //  Track courses state
  const [enrolledCourses, setEnrolledCourses] = useState<CourseType[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseType[]>([]);

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
  };

  // Function to fetch and set courses
  const fetchAndSetCourses = async () => {
    try {
      const allCoursesResponse = await getAllCourses();
      const userCoursesResponse = await getUserCourses();
      if (allCoursesResponse && userCoursesResponse) {
        const enrolledCourses = userCoursesResponse.courses;
        const availableCourses = allCoursesResponse.courses.filter(
          (course: CourseType) =>
            !enrolledCourses.some(
              (enrolledCourse: CourseType) =>
                enrolledCourse.code === course.code
            )
        );
        setEnrolledCourses(enrolledCourses);
        setAvailableCourses(availableCourses);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  //  Handle Register
  const handleRegister = async () => {
    // Clear any previous errors
    setRegisterError("");

    // Validate inputs
    if (!name.trim()) {
      setRegisterError("Username is required");
      return;
    }

    if (!isValidEmail(email)) {
      setRegisterError("Please enter a valid email address");
      return;
    }

    if (!isValidPassword(password)) {
      setRegisterError("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await register(name, email, password);
      if (response) {
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        setUser({ name, email, isLoggedIn: true });
        await handleLogin();
        onClose();
      }
    } catch (error) {
      // Check if error is an instance of Error and has a message
      if (error instanceof Error) {
        setRegisterError(error.message);
      } else {
        setRegisterError("An unexpected error occurred during registration");
      }
    }
  };

  //  Handle Login
  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      if (response) {
        setLoginError("");
        localStorage.setItem("authToken", response.access_token);
        localStorage.setItem("userName", response.user.username);
        localStorage.setItem("userEmail", response.user.email);
        setUser({
          name: response.user.username,
          email: response.user.email,
          isLoggedIn: true,
        });
        await fetchAndSetCourses();
        onClose();
      }
    } catch (error) {
      // @ts-expect-error error has message property
      if (error.message === "Invalid credentials") {
        setLoginError("Invalid email or password. Please try again.");
      } else {
        console.error("Failed to login:", error);
        setLoginError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser({ name: "", email: "", isLoggedIn: false });
  };

  // Handle Course Enrollment
  const handleEnroll = async (course: CourseType) => {
    try {
      const response = await enrollCourse(course.code);
      if (response) {
        await fetchAndSetCourses(); // Fetch and set courses after enrollment
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
    }
  };

  // Handle Course Unenrollment
  const handleUnenroll = async (course: CourseType) => {
    try {
      const response = await dropCourse(course.code);
      if (response) {
        await fetchAndSetCourses(); // Fetch and set courses after enrollment
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
    }
  };

  useEffect(() => {
    if (user.isLoggedIn) {
      fetchAndSetCourses();
    }
  }, [user.isLoggedIn]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-6 rounded-lg bg-[#E9F3DA] max-w-3xl w-full">
        <DialogTitle>
          {user.isLoggedIn ? "Profile" : isSigningUp ? "Sign Up" : "Login"}
        </DialogTitle>

        {user.isLoggedIn ? (
          // Logged-in User View
          <div className="space-y-4">
            <p>Welcome, {user.name}!</p>
            <p>Email: {user.email}</p>

            {/* Logout Button */}
            <Button
              className="w-full bg-[#FFE0A0] text-black hover:bg-orange-400"
              onClick={handleLogout}
            >
              Logout
            </Button>

            {/* Courses Section */}
            <Course
              enrolledCourses={enrolledCourses}
              availableCourses={availableCourses}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
            />
          </div>
        ) : (
          //  Login/Register Form
          <div className="space-y-4">
            {isSigningUp && (
              <Input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* New error message display */}
            {loginError && (
              <p className="text-red-500 text-sm text-center">{loginError}</p>
            )}

            {registerError && (
              <p className="text-red-500 text-sm text-center">
                {registerError}
              </p>
            )}

            {isSigningUp ? (
              <Button className="w-full" onClick={handleRegister}>
                Sign Up
              </Button>
            ) : (
              <Button className="w-full" onClick={handleLogin}>
                Login
              </Button>
            )}

            <p className="text-center text-sm">
              {isSigningUp
                ? "Already have an account? "
                : "Don't have an account yet? "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => {
                  setIsSigningUp(!isSigningUp);
                  // Reset all fields and error messages
                  setName("");
                  setEmail("");
                  setPassword("");
                  setLoginError("");
                  setRegisterError("");
                }}
              >
                {isSigningUp ? "Login" : "Sign Up"}
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}