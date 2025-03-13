"use client";

import { useState, useEffect } from "react";
import CourseDropdown from "../components/CourseDropdown";
import { useAutoScroll } from "../hooks/autoscroll";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export default function Chatbot() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [sidebarCourses, setSidebarCourses] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [courseError, setCourseError] = useState<string | null>(null);

  const { chatRef, scrollToBottom } = useAutoScroll();

  // Remove error message after 5 seconds
  useEffect(() => {
    if (courseError) {
      const timer = setTimeout(() => {
        setCourseError(null);
      }, 5000); 

      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [courseError]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("http://localhost:3000/api/courses");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data: string[] = await res.json();
        setAvailableCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }
    fetchCourses();
  }, []);

  const addCourse = (course: string) => {
    setSidebarCourses((prev) => [...prev, course]);
    setAvailableCourses((prev) => prev.filter((c) => c !== course));
    setSelectedCourse(course);
    setCourseError(null); // Clear course selection error

    setMessages((prev) => ({
      ...prev,
      [course]: [
        {
          text: `Hi, I’m TutorBot, your personal AI tutor for ${course}. How can I help you?`,
          sender: "bot",
        },
      ],
    }));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    if (!selectedCourse) {
      setCourseError("Please add a chatbot for a course before sending a message.");
      return;
    }
  
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [...(prev[selectedCourse] || []), { text: input, sender: "user" }],
    }));
  
    scrollToBottom();
  
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [...prev[selectedCourse], { text: "...", sender: "bot" }],
    }));
  
    setInput("");
  
    try {
      // Get JWT token 
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }
  
      const response = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include JWT token
        },
        body: JSON.stringify({
          question: input,
          retriever_type: "HybridRetriever", // Default retriever type
        }),
      });
  
      if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait and try again.");
      }
  
      const data = await response.json();
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      // Update messages with bot's response
      setMessages((prev) => ({
        ...prev,
        [selectedCourse]: [...prev[selectedCourse].slice(0, -1), { text: data.answer, sender: "bot" }],
      }));
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => ({
        ...prev,
        [selectedCourse]: [...prev[selectedCourse].slice(0, -1), { text: error.message, sender: "bot" }],
      }));
    }
  };  

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-1/4 border-r p-4 bg-white">
          <h1 className="relative text-5xl uppercase w-fit mx-auto">
            <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 w-full bg-[#E9F3DA]"></span>
            <span className="relative font-mono">CHATBOT</span>
          </h1>
          <div className="flex flex-col space-y-2 mt-6">
            {sidebarCourses.map((course) => (
              <button
                key={course}
                className={`p-3 rounded-md text-center font-mono text-2xl ${
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
            <CourseDropdown availableCourses={availableCourses} addCourse={addCourse} />
          </div>
        </aside>
  
        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full">
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto min-h-0">
            {(messages[selectedCourse!] || []).map((msg, index) => (
              <div key={index} className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 font-mono rounded-lg max-w-xs ${msg.sender === "user" ? "bg-yellow-100" : "bg-[#E9F3DA]"}`}>
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
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
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