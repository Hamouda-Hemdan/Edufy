// app/api/profile/route.ts
import { NextResponse } from "next/server";
import connect from "@/util/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export async function GET(request: Request) {
  try {
    // Connect to database
    await connect();

    // Check authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Token required" },
        { status: 401 }
      );
    }

    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Get user data (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return profile data
    const profileData: ProfileResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || "/assets/default-avatar.png",
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("[PROFILE_API_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
