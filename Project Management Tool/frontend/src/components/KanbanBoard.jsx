import React from "react";
import { Badge, statusTone, priorityTone } from "./ui";
import { Calendar, User } from "lucide-react";

const COLUMNS = [
  { k: "todo", label: "To Do" },
  { k: "in-progress", label: "In Progress" },
  { k: "review", label: "Review" },
  { k: "done", label: "Done" },
];

export default function KanbanBoard({ tasks, onChange, onOpen }) {
  const onDragStart = (e, id) => e.dataTransfer.setData("id", id);
  const onDrop = (e, status) => {
    const id = e.dataTransfer.getData("id");
    if (id) onChange(id, { status });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((c) => {
        const list = tasks.filter((t) => t.status === c.k);
        return (
          <div key={c.k} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, c.k)}
               className="bg-bg-soft border border-border rounded-xl p-3 min-h-[200px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <h4 className="text-sm font-semibold text-white">{c.label}</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-bg text-gray-400">{list.length}</span>
            </div>
            <div className="space-y-2">
              {list.map((t) => (
                <div key={t._id} draggable onDragStart={(e) => onDragStart(e, t._id)} onClick={() => onOpen(t)}
                     className="p-3 rounded-lg bg-bg-card border border-border hover:border-brand/50 cursor-pointer transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm text-white">{t.title}</div>
                    <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                  </div>
                  {t.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.description}</p>}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><User size={11} /> {t.assignee?.name || "Unassigned"}</span>
                    {t.dueDate && <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(t.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
