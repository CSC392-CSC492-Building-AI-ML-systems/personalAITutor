"use client";

import { useState, useEffect } from "react";
import CourseDropdown from "../components/CourseDropdown"; // Import the dropdown component
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

  const { chatRef, scrollToBottom } = useAutoScroll();

  // Fetch courses from API on mount
  useEffect(() => {
    async function fetchCourses() {
      try {
        if (typeof window !== "undefined") {
          console.log("Client-side only code running!");
        }
        console.log("Fetching courses...");
        const res = await fetch("http://localhost:3000/api/courses");

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data: string[] = await res.json();
        console.log("Courses fetched:", data);
        setAvailableCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }
    fetchCourses();
  }, []);

  // Function to add a course to the sidebar
  const addCourse = (course: string) => {
    setSidebarCourses((prev) => [...prev, course]); // Add to sidebar
    setAvailableCourses((prev) => prev.filter((c) => c !== course)); // Remove from dropdown
    setSelectedCourse(course); // Select the newly added course
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
    if (!input.trim() || !selectedCourse) return;
  
    // Add user's message to UI immediately
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [...(prev[selectedCourse] || []), { text: input, sender: "user" }],
    }));

    scrollToBottom();
  
    // Add a placeholder bot message while waiting for the response
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [
        ...prev[selectedCourse],
        { text: "...", sender: "bot" }, // Placeholder
      ],
    }));
  
    setInput(""); // Clear input field
  
    try {
      const response = await fetch(`/api/chat?course=${selectedCourse}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
  
      const reader = response.body?.getReader();
      if (!reader) return;
  
      const decoder = new TextDecoder();
      let aiMessage = "";
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiMessage += decoder.decode(value, { stream: true });
  
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [
            ...prev[selectedCourse].slice(0, -1), // Remove the "Thinking..." placeholder
            { text: aiMessage, sender: "bot" },
          ],
        }));
      }
    } catch (error) {
      console.error("Error sending message", error);
      setMessages((prev) => ({
        ...prev,
        [selectedCourse]: [
          ...prev[selectedCourse].slice(0, -1), // Remove placeholder
          { text: "Error generating response. Please try again.", sender: "bot" },
        ],
      }));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-1/4 border-r p-4 bg-white">
          <h1 className="relative text-5xl uppercase w-fit mx-auto">
            <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 w-full" style={{ backgroundColor: "#E9F3DA" }}></span>
            <span className="relative font-mono">CHATBOT</span>
          </h1>
          <div className="flex flex-col space-y-2 mt-6">
            {/* Render selected courses */}
            {sidebarCourses.map((course) => (
              <button
                key={course}
                className={`p-3 rounded-md text-center font-mono text-2xl ${
                  selectedCourse === course ? "font-semibold" : ""
                }`}
                style={selectedCourse === course ? { backgroundColor: "#FFF0D2" } : { backgroundColor: "#FAFAEB" }}
                onClick={() => setSelectedCourse(course)}
              >
                {course}
              </button>
            ))}
  
            {/* Radix UI Dropdown for adding courses */}
            <CourseDropdown availableCourses={availableCourses} addCourse={addCourse} />
          </div>
        </aside>
  
        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full">
          {/* Messages Container - Scrollable */}
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto min-h-0">
            {(messages[selectedCourse!] || []).map((msg, index) => (
              <div key={index} className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 font-mono rounded-lg max-w-xs ${msg.sender === "user" ? "bg-yellow-100" : "bg-[#E9F3DA]"}`}>
                  {msg.text} {/* No markdown */}
                </div>
              </div>
            ))}
          </div>
  
          {/* Input Box - Fixed at Bottom */}
          <div className="p-4 bg-white border-t flex items-center">
            <div className="relative w-full">
              {/* Input Field */}
              <input
                type="text"
                className="w-full p-4 pr-12 border-none rounded-full bg-[#FFF0D2] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && selectedCourse && sendMessage()}
              />
              
              {/* Send Button (Inside Input) */}
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={sendMessage}
                disabled={!selectedCourse}
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
