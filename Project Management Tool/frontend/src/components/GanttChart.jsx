import React, { useMemo } from "react";
import { Card } from "./ui";

const DAY = 24 * 60 * 60 * 1000;

export default function GanttChart({ tasks }) {
  const items = tasks.filter((t) => t.startDate && t.dueDate);
  const { start, end } = useMemo(() => {
    if (!items.length) return { start: new Date(), end: new Date(Date.now() + 7 * DAY) };
    const s = Math.min(...items.map((t) => new Date(t.startDate).getTime()));
    const e = Math.max(...items.map((t) => new Date(t.dueDate).getTime()));
    return { start: new Date(s), end: new Date(e + DAY) };
  }, [items]);

  const totalDays = Math.max(1, Math.round((end - start) / DAY));
  const days = Array.from({ length: totalDays }, (_, i) => new Date(start.getTime() + i * DAY));
  const colW = 36;
  const labelW = 200;

  const colorByStatus = { todo: "#6b7280", "in-progress": "#06b6d4", review: "#f59e0b", done: "#22c55e" };

  if (!items.length) return <Card className="p-8 text-center text-gray-400">No tasks with start & due dates yet.</Card>;

  return (
    <Card className="p-4 overflow-x-auto">
      <div style={{ minWidth: labelW + totalDays * colW }}>
        <div className="flex border-b border-border pb-2 mb-2 sticky top-0 bg-bg-card">
          <div style={{ width: labelW }} className="text-xs font-semibold text-gray-400 px-2">Task</div>
          <div className="flex">
            {days.map((d, i) => (
              <div key={i} style={{ width: colW }} className="text-[10px] text-gray-500 text-center border-l border-border">
                <div>{d.toLocaleDateString(undefined, { month: "short" })}</div>
                <div className="font-bold text-gray-300">{d.getDate()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {items.map((t) => {
            const ts = new Date(t.startDate).getTime();
            const te = new Date(t.dueDate).getTime();
            const offset = Math.round((ts - start.getTime()) / DAY) * colW;
            const width = Math.max(colW, Math.round((te - ts) / DAY + 1) * colW);
            return (
              <div key={t._id} className="flex items-center">
                <div style={{ width: labelW }} className="text-sm text-gray-200 px-2 truncate">{t.title}</div>
                <div className="relative flex-1 h-8">
                  <div className="absolute inset-y-0 left-0 right-0 flex">
                    {days.map((_, i) => <div key={i} style={{ width: colW }} className="border-l border-border/50" />)}
                  </div>
                  <div className="absolute top-1 h-6 rounded shadow-glow flex items-center px-2 text-[10px] text-white font-medium"
                       style={{ left: offset, width, background: colorByStatus[t.status] }}>
                    {t.progress > 0 && (
                      <div className="absolute inset-y-0 left-0 bg-white/25 rounded-l" style={{ width: `${t.progress}%` }} />
                    )}
                    <span className="relative z-10 truncate">{t.assignee?.name || "Unassigned"} · {t.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
