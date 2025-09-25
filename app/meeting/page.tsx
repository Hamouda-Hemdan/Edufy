"use client";

import { useState } from "react";
import WhiteboardWrapper from "@/components/WhiteboardWrapper";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  LogOut,
} from "lucide-react";

export default function MeetingPage() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main className="h-screen w-screen flex bg-gray-900 text-white">
      <div className="flex-1 relative flex flex-col">
        <WhiteboardWrapper />
        {/* Controls bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-75 rounded-full flex space-x-6 px-6 py-3 items-center shadow-lg">
          {/* Camera toggle */}
          <button
            onClick={() => setCamOn((v) => !v)}
            className={`p-2 rounded-full hover:bg-gray-700 transition ${
              camOn ? "bg-green-600" : "bg-red-600"
            }`}
            aria-label="Toggle Camera"
          >
            {camOn ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>
          {/* Mic toggle */}
          <button
            onClick={() => setMicOn((v) => !v)}
            className={`p-2 rounded-full hover:bg-gray-700 transition ${
              micOn ? "bg-green-600" : "bg-red-600"
            }`}
            aria-label="Toggle Microphone"
          >
            {micOn ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>
          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen((v) => !v)}
            className="p-2 rounded-full hover:bg-gray-700 transition bg-blue-600"
            aria-label="Toggle Chat"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          {/* Leave call */}
          <button
            onClick={() => alert("Leaving call")}
            className="p-2 rounded-full hover:bg-red-700 bg-red-600 transition"
            aria-label="Leave Call"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
      {/* Chat panel */}
      {chatOpen && (
        <aside className="w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Chat</h2>
          <div className="flex-1 overflow-y-auto mb-2">
            {/* Replace with real chat messages */}
            <p className="mb-1">User1: Hello!</p>
            <p className="mb-1">User2: Hi there!</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // handle send message
              alert("Send message feature to implement");
            }}
            className="flex"
          >
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-l bg-gray-700 px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 px-4 rounded-r hover:bg-blue-700 transition"
            >
              Send
            </button>
          </form>
        </aside>
      )}
    </main>
  );
}
