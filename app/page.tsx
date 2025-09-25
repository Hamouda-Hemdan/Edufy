"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoIcon, LogInIcon } from "lucide-react"; // If you don't use lucide, remove or replace

export default function Home() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");

  const handleCreateMeeting = () => {
    router.push("/settings");
  };

  const handleJoinMeeting = () => {
    router.push("/settings");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="text-center mb-12 animate-fade-in group cursor-pointer">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-4 drop-shadow-lg">
          Video Calls & Meetings for Everyone
        </h1>

        <p className="text-gray-400 text-xl font-medium mb-4">
          with{" "}
          <span className="text-orange-500 font-semibold">
            powerful Whiteboard collaboration
          </span>
          .
        </p>

        <svg
          viewBox="0 0 600 30"
          preserveAspectRatio="none"
          className="mx-auto h-8 w-full max-w-4xl text-orange-500 transition-colors duration-300"
        >
          <path
            d="M0 15 
         C40 10, 80 25, 120 15 
         S200 10, 240 20 
         Q280 25, 320 15 
         T400 15 
         C440 10, 480 30, 520 15 
         S580 10, 600 20"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="group-hover:text-yellow-400"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <button
          onClick={handleCreateMeeting}
          className="bg-orange-500 shadow-lg shadow-orange-500/30 text-black font-semibold py-3 rounded-xl hover:bg-orange-400 hover:scale-105 transition duration-200 flex items-center justify-center gap-2"
        >
          <VideoIcon className="w-5 h-5" />
          Create a Meeting
        </button>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter meeting code"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
          />
          <button
            onClick={handleJoinMeeting}
            className="bg-orange-500 text-black px-6 py-3 rounded-xl hover:bg-orange-400 hover:scale-105 transition duration-200 flex items-center justify-center gap-2"
          >
            <LogInIcon className="w-5 h-5" />
            Join
          </button>
        </div>
      </div>
    </main>
  );
}
