"use client";

import { useState } from "react";

export default function SessionsPage() {
  // Example session data (replace with real data later)
  const [sessions, setSessions] = useState([
    {
      id: "1",
      title: "Math Study Group",
      date: "2025-06-20 18:00",
    },
    {
      id: "2",
      title: "Physics Q&A",
      date: "2025-06-21 15:30",
    },
    {
      id: "3",
      title: "Chemistry Review",
      date: "2026-06-23 20:00",
    },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleDelete = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRename = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
    setEditingId(null);
    setNewTitle("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-8">Your Sessions</h1>
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-gray-900 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between border border-gray-700 transition-colors duration-200 hover:bg-gray-800"
          >
            <div>
              {editingId === session.id ? (
                <input
                  className="text-xl font-semibold mb-2 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(session.id);
                  }}
                  autoFocus
                />
              ) : (
                <div className="text-xl font-semibold mb-2">
                  {session.title}
                </div>
              )}
              <div className="text-gray-400 text-sm">{session.date}</div>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition font-bold text-white"
                onClick={() => alert(`Viewing session: ${session.title}`)}
              >
                View
              </button>
              {editingId === session.id ? (
                <button
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition font-bold text-white"
                  onClick={() => handleRename(session.id)}
                >
                  Save
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 transition font-bold text-white"
                  onClick={() => {
                    setEditingId(session.id);
                    setNewTitle(session.title);
                  }}
                >
                  Rename
                </button>
              )}
              <button
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition font-bold text-white"
                onClick={() => handleDelete(session.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
