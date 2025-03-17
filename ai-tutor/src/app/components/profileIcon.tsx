"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import Profile from "./profile"; // Import modal component

type User = {
  name?: string;
  isLoggedIn: boolean;
};

// ProfileIcon Component: Displays circular initials and triggers the modal
export default function ProfileIcon({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);

  // Get initials from name
  const getInitials = (name: string | undefined): string => {
    if (!name || typeof name !== "string" || !name.trim()) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Profile Icon (Opens Modal) */}
      <Card
        className="w-20 h-20 flex items-center justify-center rounded-full shadow-md cursor-pointer"
        style={{ backgroundColor: "#E9F3DA" }}
        onClick={() => setIsOpen(true)} // Open modal on click
      >
        <CardContent className="flex items-center justify-center w-full h-full p-0">
          <span className="text-lg font-bold text-black flex items-center justify-center w-full h-full">
            {getInitials(user?.name)}
          </span>
        </CardContent>
      </Card>

      {/* Profile Modal Component */}
      {isOpen && <Profile user={user} onClose={() => setIsOpen(false)} />}
    </>
  );
}
