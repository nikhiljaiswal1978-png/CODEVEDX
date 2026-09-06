import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { "en-US": enUS } });

export default function CalendarView({ tasks, onOpen }) {
  const events = tasks
    .filter((t) => t.dueDate)
    .map((t) => ({
      id: t._id, title: t.title, start: new Date(t.startDate || t.dueDate), end: new Date(t.dueDate), raw: t,
    }));
  return (
    <div style={{ height: 620 }}>
      <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end"
        onSelectEvent={(e) => onOpen(e.raw)} popup />
    </div>
  );
}
