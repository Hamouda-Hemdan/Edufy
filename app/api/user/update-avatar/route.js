// app/api/user/update-avatar/route.js
import { NextResponse } from "next/server";
import connect from "@/util/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function PATCH(req) {
  try {
    // Connect to database
    await connect();

    // Get token from headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get the new avatar from request body
    const { avatar } = await req.json();
    if (!avatar) {
      return NextResponse.json(
        { error: "Avatar URL is required" },
        { status: 400 }
      );
    }

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id, // Using decoded.id from your token
      { avatar },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create new token with updated user info if needed
    const newToken = jwt.sign(
      { 
        id: updatedUser._id, 
        name: updatedUser.name, 
        avatar: updatedUser.avatar 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ 
      message: "Avatar updated successfully",
      avatar: updatedUser.avatar,
      token: newToken // Send new token if you want to update client-side
    });

  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update avatar" },
      { status: 500 }
    );
  }
}