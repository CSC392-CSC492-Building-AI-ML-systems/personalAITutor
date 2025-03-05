import { useEffect, useRef, useState } from "react";

export function useAutoScroll() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (shouldScroll && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
      setShouldScroll(false); // Reset after scrolling
    }
  }, [shouldScroll]);

  const scrollToBottom = () => setShouldScroll(true);

  return { chatRef, scrollToBottom };
}
