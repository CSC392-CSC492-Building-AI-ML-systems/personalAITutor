"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import Profile from "./profile"; 

type User = {
  name?: string;
  email?: string;
  isLoggedIn: boolean;
};

export default function ProfileIcon({ user, setUser }: { user: User; setUser: any }) {
  const [isOpen, setIsOpen] = useState(false);

  // Get initials from name
  const getInitials = (name: string | undefined): string => {
    if (!name || !name.trim()) return "?";
    return name.split(" ").map((word) => word.charAt(0)).join("").toUpperCase();
  };

  return (
    <>
      {/* Profile Icon (Opens Modal) */}
      <Card
        className="w-20 h-20 flex items-center justify-center rounded-full shadow-md cursor-pointer"
        style={{ backgroundColor: "#E9F3DA" }}
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="flex items-center justify-center w-full h-full p-0">
          <span className="text-lg font-bold text-black flex items-center justify-center w-full h-full">
            {getInitials(user?.name)}
          </span>
        </CardContent>
      </Card>

      {/* Profile Modal */}
      {isOpen && <Profile user={user} setUser={setUser} onClose={() => setIsOpen(false)} />}
    </>
  );
}
