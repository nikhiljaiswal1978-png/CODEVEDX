import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Modal, Input, Textarea, Select, Button } from "./ui";
import FilesPanel from "./FilesPanel";
import { Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const EMPTY = { title: "", description: "", status: "todo", priority: "medium", assignee: "", startDate: "", dueDate: "", progress: 0, project: "" };

export default function TaskModal({ open, onClose, task, projectId, projects = [], users = [], onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const projectLocked = !!projectId;

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "", description: task.description || "", status: task.status || "todo", priority: task.priority || "medium",
        assignee: task.assignee?._id || "", startDate: task.startDate ? task.startDate.slice(0, 10) : "", dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        progress: task.progress || 0, project: task.project?._id || task.project || projectId || "",
      });
      api.get(`/comments/task/${task._id}`).then((r) => setComments(r.data)).catch(() => setComments([]));
    } else {
      setForm({ ...EMPTY, project: projectId || projects[0]?._id || "" }); setComments([]); setText("");
    }
  }, [task, projectId, projects]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.project) return;
    const payload = { ...form, assignee: form.assignee || null };
    if (task) await api.put(`/tasks/${task._id}`, payload);
    else await api.post("/tasks", payload);
    onSaved?.(); onClose();
  };

  const remove = async () => {
    if (!task || !window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${task._id}`); onSaved?.(); onClose();
  };

  const addComment = async (e) => {
    e.preventDefault(); if (!text.trim() || !task) return;
    const { data } = await api.post(`/comments/task/${task._id}`, { text }); setComments((c) => [...c, data]); setText("");
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit Task" : "New Task"}>
      <form onSubmit={save} className="space-y-3">
        {!projectLocked && <Select required value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}><option value="">Select project</option>{projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</Select>}
        <Input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["todo", "in-progress", "review", "done"].map(s => <option key={s} value={s}>{s}</option>)}</Select>
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{["low", "medium", "high", "urgent"].map(s => <option key={s} value={s}>{s}</option>)}</Select>
          <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <Select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}><option value="">Unassigned</option>{users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</Select>
          <Input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
        </div>
        <div className="flex gap-2"><Button type="submit" className="flex-1">{task ? "Save" : "Create"}</Button>{task && <Button type="button" variant="danger" onClick={remove}><Trash2 size={14} /></Button>}</div>
      </form>
      {task && <div className="mt-6 space-y-4"><div><h4 className="text-sm font-semibold text-white mb-2">Comments</h4><div className="space-y-2 max-h-44 overflow-y-auto">{comments.map(c => <div key={c._id} className="p-2 rounded-lg bg-bg-soft border border-border"><div className="flex items-center justify-between"><div className="text-xs text-brand-soft font-medium">{c.author?.name}</div><div className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</div></div><p className="text-sm text-gray-200 mt-1">{c.text}</p></div>)}{!comments.length && <p className="text-xs text-gray-500">No comments yet.</p>}</div><form onSubmit={addComment} className="flex gap-2 mt-2"><Input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment…" /><Button type="submit"><Send size={14} /></Button></form></div><FilesPanel taskId={task._id} /></div>}
    </Modal>
  );
}
