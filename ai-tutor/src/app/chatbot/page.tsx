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
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [selectedSidebarCourses, setSelectedSidebarCourses] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [chatbotCourses, setChatbotCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<string[]>([]);
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

  // Fetch message history for a given course, then scroll to bottom
  const fetchMessageHistory = useCallback(
    async (course: string) => {
      try {
        const data = await getHistory(course);
        if (!data || data.length === 0) {
          setMessages((prev) => ({
            ...prev,
            [course]: prev[course] || [],
          }));
          scrollToBottom();
          return;
        }
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
        scrollToBottom();
      } catch (error) {
        console.error("Failed to fetch message history:", error);
      }
    },
    [scrollToBottom]
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

  // When a sidebar course is clicked, mark it as selected and active.
  const handleCourseClick = useCallback((courseCode: string) => {
    setActiveCourse(courseCode);
    setCourseError(null);
    setSelectedSidebarCourses((prev) => {
      if (!prev.includes(courseCode)) {
        scrollToBottom();
        return [...prev, courseCode];
      }
      scrollToBottom();
      return prev;
    });
  }, [scrollToBottom]);

  // Add a course to the sidebar (if not already added)
  const addCourse = useCallback(
    async (courseToAdd: string) => {
      setSelectedSidebarCourses((prev) => {
        if (!prev.includes(courseToAdd)) {
          return [...prev, courseToAdd];
        }
        return prev;
      });
      setActiveCourse(courseToAdd);
      setCourseError(null);

      // Set initial bot message for this course
      setMessages((prev) => ({
        ...prev,
        [courseToAdd]: [
          {
            text: `Hi, I’m Advisory, your personal AI tutor for ${courseToAdd}. How can I help you?`,
            sender: "bot",
          },
        ],
      }));

      // Re-run enrollment check and fetch message history if enrolled
      const updatedEnrollments = await updateEnrollmentStatus();
      if (updatedEnrollments.includes(courseToAdd)) {
        await fetchMessageHistory(courseToAdd);
      }
    },
    [fetchMessageHistory, updateEnrollmentStatus]
  );

  // Send a message to the chatbot after updating enrollment status
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    if (!activeCourse) {
      setCourseError("Please add a chatbot for a course before sending a message.");
      return;
    }

    // Check for authentication token
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessages((prev) => ({
        ...prev,
        [activeCourse]: [
          ...prev[activeCourse].slice(0, -1),
          { text: "User not authenticated. Please log in!", sender: "bot" },
        ],
      }));
      return;
    }

    // Update enrollment status before sending the message
    const updatedEnrollments = await updateEnrollmentStatus();
    if (!updatedEnrollments.includes(activeCourse)) {
      setMessages((prev) => ({
        ...prev,
        [activeCourse]: [
          ...prev[activeCourse].slice(0, -1),
          { text: "Not enrolled in this course!", sender: "bot" },
        ],
      }));
      return;
    }

    // Append user's message
    setMessages((prev) => ({
      ...prev,
      [activeCourse]: [
        ...(prev[activeCourse] || []),
        { text: input, sender: "user" },
      ],
    }));

    scrollToBottom();

    // Append a placeholder for the bot's response
    setMessages((prev) => ({
      ...prev,
      [activeCourse]: [
        ...prev[activeCourse],
        { text: "...", sender: "bot" },
      ],
    }));

    setInput("");

    // Check if the course has a chatbot
    if (!chatbotCourses.includes(activeCourse)) {
      setMessages((prev) => ({
        ...prev,
        [activeCourse]: [
          ...prev[activeCourse].slice(0, -1),
          { text: "This course does not have a chatbot yet!", sender: "bot" },
        ],
      }));
      return;
    }

    try {
      // Ask and update the conversation
      const response = await askQuestion(activeCourse, input);
      if (response && response.answer) {
        const parsedAnswer = await marked(response.answer);
        setMessages((prev) => ({
          ...prev,
          [activeCourse]: [
            ...prev[activeCourse].slice(0, -1),
            { text: parsedAnswer, sender: "bot" },
          ],
        }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      if (error.message === "User not authenticated") {
        setMessages((prev) => ({
          ...prev,
          [activeCourse]: [
            ...prev[activeCourse].slice(0, -1),
            { text: "User not authenticated. Please log in!", sender: "bot" },
          ],
        }));
      } else if (error.message === "Too many requests") {
        setMessages((prev) => ({
          ...prev,
          [activeCourse]: [
            ...prev[activeCourse].slice(0, -1),
            { text: "Too many requests. Please try again later!", sender: "bot" },
          ],
        }));
      } else {
        console.error("Error asking question:", error);
        setMessages((prev) => ({
          ...prev,
          [activeCourse]: [
            ...prev[activeCourse].slice(0, -1),
            { text: "Error generating response. Please try again!", sender: "bot" },
          ],
        }));
      }
    }
  }, [input, activeCourse, chatbotCourses, scrollToBottom, updateEnrollmentStatus]);

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
      sendMessage().catch((error) =>
        console.error("Failed to send landing message", error)
      );
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
            {selectedSidebarCourses.map((courseCode) => (
              <button
                key={courseCode}
                className={`p-3 rounded-md text-center text-2xl ${
                  activeCourse === courseCode ? "font-semibold" : ""
                }`}
                style={
                  activeCourse === courseCode
                    ? { backgroundColor: "#FFF0D2" }
                    : { backgroundColor: "#FAFAEB" }
                }
                onClick={() => handleCourseClick(courseCode)}
              >
                {courseCode}
              </button>
            ))}
            <CourseDropdown
              availableCourses={allCourses}
              sidebarCourses={selectedSidebarCourses}
              addCourse={addCourse}
            />
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full">
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto min-h-0">
            {(activeCourse && messages[activeCourse]
              ? messages[activeCourse]
              : []
            ).map((msg, index) => (
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
