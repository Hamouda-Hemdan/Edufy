import User from "@/models/User";
import connect from "@/util/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { name, email, password } = await request.json();

    await connect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new NextResponse("Email is already in use", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      avatar: "/default-avatar.png",
    });

    await newUser.save();

    return new NextResponse("User is registered", { status: 200 });
  } catch (err: any) {
    console.error("Error during registration:", err.message);
    return new NextResponse("Failed to register user", { status: 500 });
  }
};
