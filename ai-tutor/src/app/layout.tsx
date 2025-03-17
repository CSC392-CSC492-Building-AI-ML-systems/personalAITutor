"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import ProfileIcon from "./components/profileIcon";
import { logout } from "../utils/authUtils"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // ✅ Global Authentication State
  const [user, setUser] = useState({
    name: "",
    email: "",
    isLoggedIn: false,
  });

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setUser({
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("userEmail") || "",
        isLoggedIn: true,
      });
    }
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser({ name: "", email: "", isLoggedIn: false });
  };

  return (
    <html lang="en">
      <body className="font-mono overflow-hidden h-screen antialiased flex flex-col">
        {/* Header */}
        <div className="border-b flex flex-none flex-row h-1/10 items-center justify-between px-6">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center">
            <Link href="/">
              <Image className="m-3" src="logo.svg" alt="advisory logo" width={80} height={80} />
            </Link>
            <Link href="/roadmaps" className="relative ml-5">
              <div className={pathname === '/roadmaps' ? 'absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 -mx-2 bg-[#FFF0D2]' : ''}></div>
              <div className="relative text-lg">ROADMAPS</div>
            </Link>
            <Link href="/chatbot" className="relative ml-5">
              <div className={pathname === '/chatbot' ? 'absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 -mx-2 bg-[#FFF0D2]' : ''}></div>
              <div className="relative text-lg">CHATBOT</div>
            </Link>
          </div>

          {/* Right Section - Profile Icon */}
          <ProfileIcon user={user} setUser={setUser} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Footer */}
        <div className="border-t flex-none text-center">
          <Link href="/" className="p-5 text-xs">Terms of Service</Link>
          <Link href="/" className="p-5 text-xs">Privacy Policy</Link>
          <Link href="/" className="p-5 text-xs">About Us</Link>
        </div>
      </body>
    </html>
  );
}
