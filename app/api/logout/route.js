// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // In a real app, you might want to handle server-side session invalidation here
  return NextResponse.json({ message: "Logged out successfully" });
}
