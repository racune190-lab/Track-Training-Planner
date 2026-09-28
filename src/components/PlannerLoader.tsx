"use client";

import dynamic from "next/dynamic";

// Load the planner only in the browser. It reads saved data from localStorage,
// which doesn't exist on the server, and FullCalendar is browser-only anyway.
const Planner = dynamic(() => import("@/components/Planner"), {
  ssr: false,
  loading: () => <p className="text-sm text-zinc-500">Loading calendar…</p>,
});

export default function PlannerLoader() {
  return <Planner />;
}
