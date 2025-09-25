import connect from "@/util/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connect();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { 
      id: user._id, 
      name: user.name,
      email: user.email,
      avatar: user.avatar, // Include avatar in token
      role: user.role 
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  return NextResponse.json({ 
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    }
  }, { status: 200 });
}