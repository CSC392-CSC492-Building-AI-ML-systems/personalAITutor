"use client";

import { useState, useEffect, useCallback, use } from "react";
import CourseDropdown from "../components/CourseDropdown";
import { useAutoScroll } from "../hooks/autoscroll";
import { getHistory, askQuestion } from "@/utils/questionUtils";
import { getAllCourses, getUserCourses } from "@/utils/courseUtils";
import { marked } from "marked";

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface Course {
  name: string;
  description: string;
  has_chatbot: boolean;
  has_roadmap: boolean;
  code: string;
}

export default function Chatbot({
  searchParams,
}: {
  searchParams: Promise<{ course: string; query: string }>;
}) {
  // Extract search parameters (assuming experimental use() hook is acceptable)
  const { course, query } = use(searchParams);

  // State variables
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [chatbotCourses, setChatbotCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [sidebarCourses, setSidebarCourses] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [fromLanding, setFromLanding] = useState(false);
  const [input, setInput] = useState("");
  const [courseError, setCourseError] = useState<string | null>(null);
  const { chatRef, scrollToBottom } = useAutoScroll();

  // Clear error message after 5 seconds
  useEffect(() => {
    if (courseError) {
      const timer = setTimeout(() => setCourseError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [courseError]);

  // Fetch courses from the backend
  const fetchCourses = useCallback(async () => {
    try {
      const allCoursesResponse = await getAllCourses();
      const userCoursesResponse = await getUserCourses();
      const allCourseCodes = allCoursesResponse.courses.map(
        (course: Course) => course.code
      );
      const enrolledCourseCodes = userCoursesResponse.courses.map(
        (course: Course) => course.code
      );
      const coursesWithChatbot = allCoursesResponse.courses
        .filter((course: Course) => course.has_chatbot)
        .map((course: Course) => course.code);
      setAllCourses(allCourseCodes);
      setEnrolledCourses(enrolledCourseCodes);
      setChatbotCourses(coursesWithChatbot);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  }, []);

  // Fetch message history for a given course
  const fetchMessageHistory = useCallback(
    async (course: string) => {
      try {
        const data = await getHistory(course);
        if (!data || data.length === 0) {
          setMessages((prev) => ({
            ...prev,
            [course]: [...(prev[course] || [])],
          }));
          return;
        }
        console.log(data.message_history);
        const messageHistory = data.message_history
          .map((qa: { question: string; answer: string }) => [
            { text: qa.question, sender: "user" },
            { text: marked(qa.answer), sender: "bot" },
          ])
          .flat();
        setMessages((prev) => ({
          ...prev,
          [course]: [...(prev[course] || []), ...messageHistory],
        }));
      } catch (error) {
        console.error("Failed to fetch message history:", error);
      }
    },
    []
  );

  // Re-check enrollment status by calling getUserCourses
  const updateEnrollmentStatus = useCallback(async () => {
    try {
      const userCoursesResponse = await getUserCourses();
      const enrolledCourseCodes = userCoursesResponse.courses.map(
        (course: Course) => course.code
      );
      setEnrolledCourses(enrolledCourseCodes);
      return enrolledCourseCodes;
    } catch (error) {
      console.error("Failed to update enrollment status:", error);
      return enrolledCourses;
    }
  }, [enrolledCourses]);

  // Add a course to the sidebar and re-run the enrollment check
  const addCourse = useCallback(
    async (courseToAdd: string) => {
      setSidebarCourses((prev) => [...prev, courseToAdd]);
      setAllCourses((prev) => prev.filter((c) => c !== courseToAdd));
      setSelectedCourse(courseToAdd);
      setCourseError(null);

      // Set initial bot message
      setMessages((prev) => ({
        ...prev,
        [courseToAdd]: [
          {
            text: `Hi, I’m Advisory, your personal AI tutor for ${courseToAdd}. How can I help you?`,
            sender: "bot",
          },
        ],
      }));

      // Re-run enrollment check
      const updatedEnrollments = await updateEnrollmentStatus();
      if (updatedEnrollments.includes(courseToAdd)) {
        await fetchMessageHistory(courseToAdd);
      }
    },
    [fetchMessageHistory, updateEnrollmentStatus]
  );

  // Send a message to the chatbot
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    if (!selectedCourse) {
      setCourseError("Please add a chatbot for a course before sending a message.");
      return;
    }

    // Append user's message
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [
        ...(prev[selectedCourse] || []),
        { text: input, sender: "user" },
      ],
    }));

    scrollToBottom();

    // Append a placeholder for the bot's response
    setMessages((prev) => ({
      ...prev,
      [selectedCourse]: [
        ...prev[selectedCourse],
        { text: "...", sender: "bot" },
      ],
    }));

    setInput("");

    try {
      // Check for authentication token
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [
            ...prev[selectedCourse].slice(0, -1),
            { text: "User not authenticated. Please log in!", sender: "bot" },
          ],
        }));
        return;
      }

    // Update enrollment status before sending the message
    const updatedEnrollments = await updateEnrollmentStatus();
    if (!updatedEnrollments.includes(selectedCourse)) {
      setMessages((prev) => ({
        ...prev,
        [selectedCourse]: [
          ...prev[selectedCourse].slice(0, -1),
          { text: "Not enrolled in this course!", sender: "bot" },
        ],
      }));
      return;
    }

      // Check if the course has a chatbot
      if (!chatbotCourses.includes(selectedCourse)) {
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [
            ...prev[selectedCourse].slice(0, -1),
            { text: "This course does not have a chatbot yet!", sender: "bot" },
          ],
        }));
        return;
      }

      // Ask the question and update the conversation
      const response = await askQuestion(selectedCourse, input);
      if (response && response.answer) {
        const parsedAnswer = await marked(response.answer);
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [
            ...prev[selectedCourse].slice(0, -1),
            { text: parsedAnswer, sender: "bot" },
          ],
        }));
        if (response.sources) {
          console.log("Sources:", response.sources);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      if (error.message === "User not authenticated") {
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [
            ...prev[selectedCourse].slice(0, -1),
            { text: "User not authenticated. Please log in!", sender: "bot" },
          ],
        }));
      } else if (error.message === "Too many requests") {
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [
            ...prev[selectedCourse].slice(0, -1),
            { text: "Too many requests. Please try again later!", sender: "bot" },
          ],
        }));
      } else {
        console.error("Error asking question:", error);
        setMessages((prev) => ({
          ...prev,
          [selectedCourse]: [
            ...prev[selectedCourse].slice(0, -1),
            { text: "Error generating response. Please try again!", sender: "bot" },
          ],
        }));
      }
    }
  }, [input, selectedCourse, chatbotCourses, scrollToBottom, updateEnrollmentStatus]);

  // Fetch initial courses and, if search params exist, add the course with query pre-filled
  useEffect(() => {
    const fetchData = async () => {
      await fetchCourses();
      if (course && query) {
        await addCourse(course);
        setInput(query);
        setFromLanding(true);
      }
    };
    fetchData();
  }, [course, query, fetchCourses, addCourse]);

  // If coming from landing with a query, send the landing message once
  useEffect(() => {
    if (fromLanding) {
      sendMessage().catch((error) => console.error("Failed to send landing message", error));
    }
  }, [fromLanding, sendMessage]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 border-r p-4 bg-white">
          <h1 className="relative text-5xl uppercase w-fit mx-auto">
            <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 w-full bg-[#E9F3DA]" />
            <span className="relative">CHATBOT</span>
          </h1>
          <div className="flex flex-col space-y-2 mt-6">
            {sidebarCourses.map((course) => (
              <button
                key={course}
                className={`p-3 rounded-md text-center text-2xl ${selectedCourse === course ? "font-semibold" : ""}`}
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
            {(selectedCourse && messages[selectedCourse] ? messages[selectedCourse] : []).map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`p-3 rounded-lg max-w-3xl ${msg.sender === "user" ? "bg-yellow-100" : "bg-[#E9F3DA]"}`}>
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t flex flex-col items-center">
            {courseError && (
              <div
                className="text-black-600 font-semibold text-lg py-2 px-4 rounded-md text-center mb-2"
                style={{ backgroundColor: "#E9F3DA" }}
              >
                {courseError}
              </div>
            )}
            <div className="relative w-full">
              <input
                type="text"
                className="w-full p-4 pr-12 border-none rounded-full bg-[#FFF0D2] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
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
