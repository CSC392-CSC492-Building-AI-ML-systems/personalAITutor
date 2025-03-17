'use client'

import { useState, useEffect, use } from "react";
import CourseDropdown from "../components/CourseDropdown";
import { useAutoScroll } from "../hooks/autoscroll";
import { askQuestion } from "../../utils/questionUtils";
import { getAllCourses, getUserCourses } from '../../utils/courseUtils';

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface Course {
  description: string;
  has_chatbot: boolean;
  has_roadmap: boolean;
  name: string;
}

export default function Chatbot({ 
  searchParams
}: {
  searchParams: Promise<{ course: string, query: string }>;
}) {

  const { course, query } = use(searchParams);

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null); // currently selected course
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]); // enrolled courses
  const [chatbotCourses, setChatbotCourses] = useState<string[]>([]); // courses that have chatbot
  const [allCourses, setAllCourses] = useState<string[]>([]); // all courses
  const [sidebarCourses, setSidebarCourses] = useState<string[]>([]); // courses that user add to the sidebar
 
  //message
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const [fromLanding, setfromLanding] = useState(false);
  
  //input
  const [input, setInput] = useState("");
  const [courseError, setCourseError] = useState<string | null>(null);
  //autoscroll
  const { chatRef, scrollToBottom } = useAutoScroll();
  
  // Error message after 5 seconds
  useEffect(() => {
    if (courseError) {
      const timer = setTimeout(() => {
        setCourseError(null);
      }, 5000); 

      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [courseError]);

  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      const allCoursesResponse = await getAllCourses();
      const userCoursesResponse = await getUserCourses();
      const allCourses = allCoursesResponse.courses.map((course: Course) => course.name);
      const enrolledCourses = userCoursesResponse.courses.map((course: Course) => course.name);
      const coursesWithChatbot = allCoursesResponse.courses
        .filter((course: Course) => course.has_chatbot)
        .map((course: Course) => course.name);
      setAllCourses(allCourses);
      setChatbotCourses(coursesWithChatbot);
      setEnrolledCourses(enrolledCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  // Fetch courses for sidebar
  useEffect(() => {
    fetchCourses();
    if (course && query) {
      addCourse(course);
      setInput(query);
      setfromLanding(true);
    }
  }, []);

  // send landing message
  useEffect(() => {
    async function sendLandingMessage() {
      if (query && course) {
        try {
          await sendMessage();
        } catch (error) {
          console.error("failed to send message", error);
        }
      }
    }
    sendLandingMessage();
  }, [fromLanding]);

  // courses added to sidebar
  const addCourse = (courseToAdd: string) => {
    setSidebarCourses((prev) => [...prev, courseToAdd]);
    setAllCourses((prev) => prev.filter((c) => c !== courseToAdd));
    setSelectedCourse(courseToAdd);
    setCourseError(null); // Clear courseToAdd selection error

    setMessages((prev) => ({
      ...prev,
      [courseToAdd]: [
        {
          text: `Hi, I’m Advisory, your personal AI tutor for ${courseToAdd}. How can I help you?`,
          sender: "bot",
        },
      ],
    }));
  };

  // send text
  const sendMessage = async () => {
    if (!input.trim()) return;
  
    if (!selectedCourse) {
      setCourseError("Please add a chatbot for a course before sending a message.");
      return;
    }

    // Add user's message to the chat
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [...(prev[selectedCourse] || []), { text: input, sender: "user" }],
    }));
  
    scrollToBottom();
  
    // Placeholder message while waiting for response
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [...prev[selectedCourse], { text: "...", sender: "bot" }],
    }));
  
    setInput("");
  
    try {
      // Check if the user is enrolled in the selected course
      if (!enrolledCourses.includes(selectedCourse)) {
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [...(prev[selectedCourse].slice(0, -1) || []), { text: "Not enrolled in this course!", sender: "bot" }],
        }));
        return;
      }

      // Check if the course has chatbot
      if (!chatbotCourses.includes(selectedCourse)) {
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [...(prev[selectedCourse].slice(0, -1) || []), { text: "This course does not have a chatbot yet!", sender: "bot" }],
        }));
        return;
      }

      // Call askQuestion instead of making direct fetch request
      const response = await askQuestion(selectedCourse, input);
  
      if (response && response.answer) {
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [...prev[selectedCourse].slice(0, -1), { text: response.answer, sender: "bot" }],
        }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setMessages((prev) => ({
        ...prev,
        [selectedCourse]: [...prev[selectedCourse].slice(0, -1), { text: "Error generating response. Please try again.", sender: "bot" }],
      }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-1/4 border-r p-4 bg-white">
          <h1 className="relative text-5xl uppercase w-fit mx-auto">
            <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 w-full bg-[#E9F3DA]"></span>
            <span className="relative">CHATBOT</span>
          </h1>
          <div className="flex flex-col space-y-2 mt-6">
            {sidebarCourses.map((course) => (
              <button
                key={course}
                className={`p-3 rounded-md text-center text-2xl ${
                  selectedCourse === course ? "font-semibold" : ""
                }`}
                style={selectedCourse === course ? { backgroundColor: "#FFF0D2" } : { backgroundColor: "#FAFAEB" }}
                onClick={() => {
                  setSelectedCourse(course);
                  setCourseError(null);
                }}
              >
                {course}
              </button>
            ))}
            <CourseDropdown availableCourses={allCourses} sidebarCourses={sidebarCourses} addCourse={addCourse} />
          </div>
        </aside>
  
        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full">
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto min-h-0">
            {(messages[selectedCourse!] || []).map((msg, index) => (
              <div key={index} className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-lg max-w-3xl ${msg.sender === "user" ? "bg-yellow-100" : "bg-[#E9F3DA]"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box - Fixed at Bottom */}
          <div className="p-4 bg-white border-t flex flex-col items-center">
            {/* Error Message (if no course is selected) */}
            {courseError && (
             <div className=" text-black-600 font-semibold text-lg py-2 px-4 rounded-md text-center mb-2 " style={ {backgroundColor: "#E9F3DA"}}>
              {courseError}
              </div>
            )}
            
            <div className="relative w-full">
              {/* Input Field */}
              <input
                type="text"
                className="w-full p-4 pr-12 border-none rounded-full bg-[#FFF0D2] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              
              {/* Send Button (Inside Input) */}
              <button
                className="text-3xl absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={sendMessage}
              > 
                ➤
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}