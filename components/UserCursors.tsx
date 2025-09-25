import { useEffect, useRef, useState } from "react";
import socket from "./socket";

interface CursorData {
  x: number;
  y: number;
  tool?: string;
  username?: string;
  color?: string;
}

export default function UserCursors() {
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCursorUpdate = (data: { id: string; cursor: CursorData }) => {
      setCursors((prev) => ({
        ...prev,
        [data.id]: data.cursor,
      }));
    };

    const handleDisconnect = (userId: string) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    };

    socket.on("cursors", handleCursorUpdate);
    socket.on("cursor_disconnect", handleDisconnect);

    return () => {
      socket.off("cursors", handleCursorUpdate);
      socket.off("cursor_disconnect", handleDisconnect);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {Object.entries(cursors).map(([userId, { x, y, username, color }]) => (
        <div
          key={userId}
          className="absolute z-50 transition-all duration-75 flex flex-col items-center"
          style={{
            left: x,
            top: y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Pointer SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={color || "#222"}
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
          >
            <path d="M2 2L22 12L13 13L12 22L2 2Z" />
          </svg>
          {/* Username below pointer */}
          <div
            className="mt-1 px-2 py-0.5 rounded bg-white bg-opacity-90 text-xs font-semibold text-gray-800 shadow"
            style={{
              maxWidth: 120,
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {username ? username : "User"}
          </div>
        </div>
      ))}
    </div>
  );
}
