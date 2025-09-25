"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);
    return () => window.removeEventListener("storage", checkAuthStatus);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login");
    window.location.reload();
  };

  return (
    <div className="mt-8">
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg mx-auto max-w-6xl">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition"
            >
              Edufy
            </Link>

            <div className="flex space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/sessions"
                    className="px-2 py-1 text-gray-800 hover:text-orange-600 font-medium transition text-sm"
                  >
                    Sessions
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/profile"
                      className="px-2 py-1 text-gray-800 hover:text-orange-600 font-medium transition text-sm"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition text-sm"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-2 py-1 text-gray-800 hover:text-orange-600 font-medium transition text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
