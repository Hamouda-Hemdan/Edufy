"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import UserCursors from "./UserCursors";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const Whiteboard = dynamic(() => import("@/components/Whiteboard"), {
  ssr: false,
});

function getRandomColor() {
  const colors = [
    "#f87171", // red
    "#60a5fa", // blue
    "#34d399", // green
    "#facc15", // yellow
    "#a78bfa", // purple
    "#f472b6", // pink
    "#fb923c", // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function WhiteboardWrapper() {
  const [username, setUsername] = useState("");
  const [color, setColor] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      setUsername(decoded.name || "User");
    } catch (err) {
      setUsername("User");
    }
    setColor(getRandomColor());
  }, [router]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Whiteboard username={username} color={color} setColor={setColor} />
      <UserCursors />
    </div>
  );
}
