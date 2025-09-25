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

    // Get the new name from request body
    const { name } = await req.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Update user's name in database
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new token with updated user info
    const newToken = jwt.sign(
      {
        id: updatedUser._id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Name updated successfully",
      name: updatedUser.name,
      token: newToken,
    });
  } catch (error) {
    console.error("Name update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update name" },
      { status: 500 }
    );
  }
}
