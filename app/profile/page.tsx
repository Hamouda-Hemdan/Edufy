"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  exp: number;
  iat: number;
}

const ProfilePage = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [bgColor, setBgColor] = useState("#60a5fa");
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch user profile data
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Try to get fresh data from API first
      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const profileData = await res.json();
        setUser(profileData);
      } else {
        // Fallback to token data if API fails
        const decoded: DecodedToken = jwtDecode(token);
        setUser(decoded);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      // If API fails, use token data
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUser(decoded);
      } catch (tokenErr) {
        console.error("Invalid token:", tokenErr);
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect immediately if no token exists
      router.push("/login");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);

      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setUser(decoded);
      setLoading(false);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  const handleAvatarSelect = async (selectedAvatar: string) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/update-avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: selectedAvatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update avatar");
      }

      // Refresh profile data after update
      await fetchProfile();
      setShowAvatarPopup(false);
    } catch (err: unknown) {
      console.error("Error updating avatar:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNameUpdate = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/update-name", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update name");
      }

      // Update local storage with new token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Refresh profile data after update
      await fetchProfile();
      setShowAvatarPopup(false);
      setNewName("");
    } catch (err: unknown) {
      console.error("Error updating name:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Info (top left, spans 2 columns) */}
        <div className="lg:col-span-2 flex flex-col bg-black-900 rounded-xl shadow-lg p-8 mb-0 pb-0 relative overflow-visible">
          {/* Banner background */}
          <div
            className="absolute left-0 right-0 top-0 h-32 rounded-xl"
            style={{ backgroundColor: bgColor, zIndex: 1 }}
          >
            {/* Theme color picker in banner */}
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="absolute top-4 right-6 w-8 h-8 p-0 border-2 border-white rounded-full shadow cursor-pointer"
              title="Pick Theme Color"
              style={{ zIndex: 2 }}
            />
          </div>
          <div
            className="flex flex-row items-end gap-8 relative z-10"
            style={{ minHeight: "120px" }}
          >
            <div className="relative" style={{ marginTop: "40px" }}>
              <img
                src={user.avatar || "/assets/default-avatar.png"}
                alt="Avatar"
                width={140}
                height={140}
                className="rounded-full border-4 border-white shadow-2xl object-cover"
                style={{ backgroundColor: bgColor }}
              />
              <button
                onClick={() => setShowAvatarPopup(true)}
                className="absolute bottom-2 right-2 bg-black/90 rounded-full p-2 hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
                title="Change avatar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <div
              className="flex-1 flex flex-col items-start"
              style={{ marginTop: "96px" }}
            >
              <h1 className="text-4xl font-bold mb-1">{user.name}</h1>
              {user.email && (
                <p className="text-gray-400 text-sm mb-4">{user.email}</p>
              )}
              {error && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg max-w-md backdrop-blur-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Friends List (right) */}
        <div className="bg-transparent rounded-xl shadow-lg p-8 flex flex-col border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Friends List</h2>
            <span className="text-sm text-gray-400">5 friends</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                id: "1",
                name: "Alice",
                avatar: "/assets/avatar1.png",
                status: "offline",
              },
              {
                id: "2",
                name: "Jone",
                avatar: "/assets/avatar2.png",
                status: "online",
              },
              {
                id: "3",
                name: "Amrs",
                avatar: "/assets/avatar3.png",
                status: "offline",
              },
              {
                id: "4",
                name: "Diana",
                avatar: "/assets/default-avatar.png",
                status: "offline",
              },
              {
                id: "5",
                name: "Eve",
                avatar: "/assets/avatar1.png",
                status: "offline",
              },
            ].map((friend) => (
              <div
                key={friend.id}
                className="bg-gray-800 rounded-lg p-3 flex flex-col items-center shadow border border-gray-700"
              >
                <div className="relative mb-2">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-14 h-14 rounded-full border-2 border-gray-600 object-cover"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                      friend.status === "online"
                        ? "bg-green-500"
                        : friend.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                </div>
                <div className="text-sm font-medium text-center truncate w-full">
                  {friend.name}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-blue-400 hover:text-blue-300 transition-colors text-right self-end text-sm">
            See All Friends &gt;&gt;
          </button>
        </div>

        {/* Recent Sessions (bottom left, spans 2 columns) */}
        <div className="lg:col-span-2 bg-transparent rounded-xl shadow-lg p-8 flex flex-col -mt-35 pt-0 mb-0 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Sessions</h2>
            <button
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              onClick={() => router.push("/sessions")}
            >
              See All Sessions &gt;&gt;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
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
            ].map((session) => (
              <div
                key={session.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-6 border-2 border-orange-500 flex flex-col items-start"
              >
                <div className="text-lg font-semibold mb-2 text-orange-600">
                  {session.title}
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm mb-4">
                  {session.date}
                </div>
                <button
                  className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600 transition font-bold text-white mt-auto"
                  onClick={() => alert(`Viewing session: ${session.title}`)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Avatar and Name Selection Modal */}
      {showAvatarPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={() => {
                  setShowAvatarPopup(false);
                  setNewName("");
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Name Editing Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameUpdate();
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white text-lg"
                placeholder="Enter your name"
              />
            </div>

            {/* Avatar Selection Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose your avatar
              </label>
              <div className="grid grid-cols-3 gap-6">
                {["avatar1.png", "avatar2.png", "avatar3.png"].map(
                  (file, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center group cursor-pointer"
                      onClick={() => handleAvatarSelect(`/assets/${file}`)}
                    >
                      <div
                        className={`p-1 rounded-full mb-2 transition-all duration-300 ${
                          user.avatar === `/assets/${file}`
                            ? "bg-blue-500/20 ring-2 ring-blue-500"
                            : "bg-transparent hover:bg-gray-800/50"
                        }`}
                      >
                        <img
                          src={`/assets/${file}`}
                          alt={`Avatar ${index + 1}`}
                          width={80}
                          height={80}
                          className={`rounded-full border-2 transition-all duration-300 ${
                            user.avatar === `/assets/${file}`
                              ? "border-blue-500"
                              : "border-gray-600 group-hover:border-gray-400"
                          } group-hover:scale-105`}
                        />
                      </div>
                      <span className="text-sm text-gray-300">
                        Avatar {index + 1}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleNameUpdate();
                  setShowAvatarPopup(false);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowAvatarPopup(false);
                  setNewName("");
                }}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
