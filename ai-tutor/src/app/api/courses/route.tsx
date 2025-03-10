import { NextResponse } from "next/server";

// Mock function to get user's courses (replace with database call)
async function getUserCourses(): Promise<string[]> {
  return ["CSC207", "CSC311"]; // Replace with real data
}

// Handle GET request to `/api/courses`
export async function GET() {
  try {
    const courses = await getUserCourses();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
