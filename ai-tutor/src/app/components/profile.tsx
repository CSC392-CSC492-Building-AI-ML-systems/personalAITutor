import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { register, login, logout } from "../../utils/authUtils"; 
import Course from "./course";

type User = {
  username?: string;
  email?: string;
  password?: string;
  isLoggedIn: boolean;
};

type CourseType = {
  id: number;
  name: string;
};

//  Dummy Course Data (Replace with API Call Later)
const allCourses: CourseType[] = [
  { id: 1, name: "CSC207" },
  { id: 2, name: "CSC311" },
  { id: 3, name: "CSC209" },
];

export default function Profile({ user, setUser, onClose }: { user: User; setUser: any; onClose: () => void }) {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //  Track courses state
  const [enrolledCourses, setEnrolledCourses] = useState<CourseType[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseType[]>(allCourses);

  //  Handle Register
  const handleRegister = async () => {
    const response = await register(username, email, password);
    if (response) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userName", username);
      localStorage.setItem("userEmail", email);
      setUser({ name, email, isLoggedIn: true });
      onClose();
    }
  };

  //  Handle Login
  const handleLogin = async () => {
    const response = await login(email, password);
    if (response) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userName", response.name);
      localStorage.setItem("userEmail", response.user.email);
      setUser({ name: response.user.name, email: response.user.email, isLoggedIn: true });
      onClose();
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser({ name: "", email: "", isLoggedIn: false });
    setEnrolledCourses([]); // Reset courses on logout
    setAvailableCourses(allCourses); // Reset available courses
  };

  //  Handle Course Enrollment
  const handleEnroll = (course: CourseType) => {
    setEnrolledCourses([...enrolledCourses, course]);
    setAvailableCourses(availableCourses.filter((c) => c.id !== course.id));
  };

  //  Handle Course Unenrollment
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
            <p>Welcome, !</p>
            <p>Email: {user.email}</p>

            {/* Logout Button */}
            <Button className="w-full bg-red-500 text-white" onClick={handleLogout}>
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
            {isSigningUp && <Input type="text" placeholder="Username" value={username} onChange={(e) => setName(e.target.value)} />}
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {isSigningUp ? (
              <Button className="w-full" onClick={handleRegister}>Sign Up</Button>
            ) : (
              <Button className="w-full" onClick={handleLogin}>Login</Button>
            )}

            <p className="text-center text-sm">
              {isSigningUp ? "Already have an account? " : "Don't have an account yet? "}
              <span className="text-blue-500 cursor-pointer" onClick={() => setIsSigningUp(!isSigningUp)}>
                {isSigningUp ? "Login" : "Sign Up"}
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
