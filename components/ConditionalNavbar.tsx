"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/dashboard");

  if (hideNavbar) return null;

  return <Navbar />;
}
