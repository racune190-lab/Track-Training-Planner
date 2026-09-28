"use client";

import { useState } from "react";
import { CATEGORIES, WEEKDAYS, type Category, type Commitment } from "@/lib/schedule";

// Values that can be pre-filled when the user drags across a time range on the calendar.
export type FormDefaults = {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;
};

type Props = {
  defaults: FormDefaults;
  onAdd: (commitment: Commitment) => void;
};

export default function AddCommitmentForm({ defaults, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("class");
  const [repeat, setRepeat] = useState<"weekly" | "once">("weekly");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([dayOfWeek(defaults.date)]);
  const [date, setDate] = useState(defaults.date);
  const [startTime, setStartTime] = useState(defaults.startTime);
  const [endTime, setEndTime] = useState(defaults.endTime);
  const [error, setError] = useState("");

  function toggleDay(day: number) {
    setDaysOfWeek((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort(),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return setError("Give it a name, like “Calculus” or “Shift at work”.");
    if (endTime <= startTime) return setError("End time must be after start time.");
    if (repeat === "weekly" && daysOfWeek.length === 0) return setError("Pick at least one day.");

    const base = { id: crypto.randomUUID(), title: title.trim(), category };
    onAdd(
      repeat === "weekly"
        ? { ...base, repeat, daysOfWeek, startTime, endTime }
        : { ...base, repeat, start: `${date}T${startTime}`, end: `${date}T${endTime}` },
    );

    setTitle("");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Add a commitment</h2>

      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Biology 101"
          className="rounded border border-zinc-300 px-2 py-1.5"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Type
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="rounded border border-zinc-300 px-2 py-1.5"
        >
          {Object.entries(CATEGORIES).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex gap-4 text-sm">
        <legend className="mb-1">Repeats</legend>
        <label className="flex items-center gap-1">
          <input type="radio" checked={repeat === "weekly"} onChange={() => setRepeat("weekly")} />
          Every week
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={repeat === "once"} onChange={() => setRepeat("once")} />
          One time
        </label>
      </fieldset>

      {repeat === "weekly" ? (
        <div className="flex flex-wrap gap-1">
          {WEEKDAYS.map((name, day) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={daysOfWeek.includes(day)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                daysOfWeek.includes(day) ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      ) : (
        <label className="flex flex-col gap-1 text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-zinc-300 px-2 py-1.5"
          />
        </label>
      )}

      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Start
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded border border-zinc-300 px-2 py-1.5"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          End
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded border border-zinc-300 px-2 py-1.5"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
        Add to calendar
      </button>
    </form>
  );
}

function dayOfWeek(isoDate: string) {
  // Parse as local noon so time zones can't shift it to the previous/next day.
  return new Date(`${isoDate}T12:00`).getDay();
}
