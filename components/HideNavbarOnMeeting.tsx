"use client";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { usePathname } from "next/navigation";

export default function HideNavbarOnMeeting() {
  const pathname = usePathname();
  if (pathname.startsWith("/meeting")) return null;
  return <ConditionalNavbar />;
}
