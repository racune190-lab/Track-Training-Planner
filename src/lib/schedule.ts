import type { EventInput } from "@fullcalendar/core";

// A "commitment" is anything the athlete can't train during: class, work, etc.
// Later steps will add AI-generated blocks (workouts, meals, sleep) alongside these.
export type Category = "class" | "work" | "other";

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  class: { label: "Class", color: "#2563eb" },
  work: { label: "Work", color: "#d97706" },
  other: { label: "Other", color: "#6b7280" },
};

// Sunday = 0 ... Saturday = 6, matching JavaScript's Date.getDay() and FullCalendar.
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type Commitment =
  | {
      id: string;
      title: string;
      category: Category;
      repeat: "weekly";
      daysOfWeek: number[];
      startTime: string; // "HH:MM", 24-hour
      endTime: string;
    }
  | {
      id: string;
      title: string;
      category: Category;
      repeat: "once";
      start: string; // ISO date-time, e.g. "2026-09-28T09:00"
      end: string;
    };

// Convert our saved data into the shape FullCalendar knows how to draw.
export function toCalendarEvent(c: Commitment): EventInput {
  const color = CATEGORIES[c.category].color;
  const base = { id: c.id, title: c.title, backgroundColor: color, borderColor: color };

  if (c.repeat === "weekly") {
    return { ...base, daysOfWeek: c.daysOfWeek, startTime: c.startTime, endTime: c.endTime };
  }
  return { ...base, start: c.start, end: c.end };
}

// Until we add a database (step 2), commitments are saved in the browser.
const STORAGE_KEY = "ttp.commitments";

export function loadCommitments(): Commitment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Commitment[]) : [];
  } catch {
    return [];
  }
}

export function saveCommitments(commitments: Commitment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commitments));
  } catch {
    // Storage can be unavailable (e.g. private browsing); the app still works for this session.
  }
}
