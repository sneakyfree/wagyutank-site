"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api } from "../lib/api";

// Fires a first-party page_view on every route change. No cookies, no third parties.
export default function Tracker() {
  const path = usePathname();
  useEffect(() => { api.track("page_view"); }, [path]);
  return null;
}
