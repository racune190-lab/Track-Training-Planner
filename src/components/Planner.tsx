"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import AddCommitmentForm, { type FormDefaults } from "@/components/AddCommitmentForm";
import {
  CATEGORIES,
  WEEKDAYS,
  loadCommitments,
  saveCommitments,
  toCalendarEvent,
  type Commitment,
} from "@/lib/schedule";

export default function Planner() {
  // This component only runs in the browser (see PlannerLoader), so reading localStorage here is safe.
  const [commitments, setCommitments] = useState<Commitment[]>(loadCommitments);
  const [formDefaults, setFormDefaults] = useState<FormDefaults>(() => ({
    date: toISODate(new Date()),
    startTime: "09:00",
    endTime: "10:00",
  }));
  // Changing this number remounts the form so it picks up new defaults.
  const [formKey, setFormKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    saveCommitments(commitments);
  }, [commitments]);

  const selected = commitments.find((c) => c.id === selectedId);

  // User dragged across a time range on the calendar: pre-fill the form with it.
  function handleSelect(info: DateSelectArg) {
    const sameDay = toISODate(info.start) === toISODate(info.end);
    setFormDefaults({
      date: toISODate(info.start),
      startTime: toHHMM(info.start),
      endTime: sameDay ? toHHMM(info.end) : "23:59",
    });
    setFormKey((k) => k + 1);
    info.view.calendar.unselect();
  }

  function handleEventClick(info: EventClickArg) {
    setSelectedId(info.event.id);
  }

  function addCommitment(c: Commitment) {
    setCommitments((all) => [...all, c]);
  }

  function deleteSelected() {
    setCommitments((all) => all.filter((c) => c.id !== selectedId));
    setSelectedId(null);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="flex w-full flex-col gap-6 lg:w-72 lg:shrink-0">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <AddCommitmentForm key={formKey} defaults={formDefaults} onAdd={addCommitment} />
        </div>

        {selected && (
          <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm">
            <h2 className="text-lg font-semibold">{selected.title}</h2>
            <p className="text-zinc-600">
              {CATEGORIES[selected.category].label} · {describeTime(selected)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={deleteSelected}
                className="rounded bg-red-600 px-3 py-1.5 font-medium text-white"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded bg-zinc-100 px-3 py-1.5 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-500">
          Tip: drag across the calendar to pre-fill a time. Click a block to delete it.
        </p>
      </aside>

      <section className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white p-4">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay,dayGridMonth",
          }}
          events={commitments.map(toCalendarEvent)}
          selectable
          selectMirror
          select={handleSelect}
          eventClick={handleEventClick}
          allDaySlot={false}
          slotMinTime="05:00:00"
          slotMaxTime="24:00:00"
          scrollTime="07:00:00"
          nowIndicator
          height="auto"
        />
      </section>
    </div>
  );
}

function describeTime(c: Commitment) {
  if (c.repeat === "weekly") {
    const days = c.daysOfWeek.map((d) => WEEKDAYS[d]).join(", ");
    return `${days}, ${c.startTime}–${c.endTime}`;
  }
  return `${c.start.slice(0, 10)}, ${c.start.slice(11)}–${c.end.slice(11)}`;
}

// Format dates in the user's local time zone (toISOString() would convert to UTC).
function toISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toHHMM(d: Date) {
  return d.toTimeString().slice(0, 5);
}
