import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { Card, Button, Badge, Modal, Input, Textarea, Select, statusTone, priorityTone } from "../components/ui";
import KanbanBoard from "../components/KanbanBoard";
import CalendarView from "../components/CalendarView";
import GanttChart from "../components/GanttChart";
import ChatPanel from "../components/ChatPanel";
import FilesPanel from "../components/FilesPanel";
import ActivityFeed from "../components/ActivityFeed";
import AnalyticsPanel from "../components/AnalyticsPanel";
import TaskModal from "../components/TaskModal";
import { Plus, KanbanSquare, CalendarDays, GanttChart as GanttIcon, MessageSquare, Paperclip, Activity, BarChart3 } from "lucide-react";

const TABS = [
  { k: "board", label: "Board", icon: KanbanSquare },
  { k: "calendar", label: "Calendar", icon: CalendarDays },
  { k: "gantt", label: "Gantt", icon: GanttIcon },
  { k: "chat", label: "Chat", icon: MessageSquare },
  { k: "files", label: "Files", icon: Paperclip },
  { k: "activity", label: "Activity", icon: Activity },
  { k: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("board");
  const [openTask, setOpenTask] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    api.get(`/projects/${id}`).then((r) => setProject(r.data));
    api.get(`/tasks?project=${id}`).then((r) => setTasks(r.data));
  }, [id]);

  const updateProjectStatus = async (status) => {
    try {
      const { data } = await api.put(`/projects/${id}`, {
        status,
      });

      setProject(data);
    } catch (error) {
      console.error("Failed to update project status", error);
    }
  };

  useEffect(() => {
    load();
    api.get("/users").then((r) => setUsers(r.data));
    const s = getSocket();
    s.emit("join:project", id);
    const onCreate = (t) => setTasks((prev) => [t, ...prev]);
    const onUpdate = (t) => setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x)));
    const onDelete = ({ id: tid }) => setTasks((prev) => prev.filter((x) => x._id !== tid));
    s.on("task:created", onCreate);
    s.on("task:updated", onUpdate);
    s.on("task:deleted", onDelete);
    return () => {
      s.emit("leave:project", id);
      s.off("task:created", onCreate);
      s.off("task:updated", onUpdate);
      s.off("task:deleted", onDelete);
    };
  }, [id, load]);

  const updateTask = async (taskId, patch) => {
    const { data } = await api.put(`/tasks/${taskId}`, patch);
    setTasks((prev) => prev.map((x) => (x._id === taskId ? data : x)));
  };

  if (!project) return <div className="text-gray-400">Loading…</div>;

  const done = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="mt-2 w-3 h-3 rounded-full" style={{ background: project.color }} />
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <p className="text-sm text-gray-400 mt-1">{project.description || "No description"}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge tone="brand">{project.status}</Badge>
                <Badge>{tasks.length} tasks</Badge>
                <Badge tone="ok">{done} done</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{progress}%</div>
            <div className="w-40 h-1.5 bg-bg rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-brand to-brand-soft" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1 bg-bg-soft border border-border rounded-lg p-1">
          {TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition ${tab === t.k ? "bg-brand text-white" : "text-gray-400 hover:text-white"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setCreating(true)}><Plus size={16} className="inline mr-1" /> Add Task</Button>
      </div>

      {tab === "board" && <KanbanBoard tasks={tasks} onChange={updateTask} onOpen={setOpenTask} />}
      {tab === "calendar" && <CalendarView tasks={tasks} onOpen={setOpenTask} />}
      {tab === "gantt" && <GanttChart tasks={tasks} />}
      {tab === "chat" && <ChatPanel projectId={id} />}
      {tab === "files" && <FilesPanel projectId={id} />}
      {tab === "activity" && <ActivityFeed projectId={id} />}
      {tab === "analytics" && <AnalyticsPanel projectId={id} />}

      {(user?.role === "admin" || user?.role === "manager") && <Select
        value={project.status}
        onChange={(e) => updateProjectStatus(e.target.value)}
      >
        <option value="active">Active</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </Select>}

      <TaskModal
        open={creating || !!openTask}
        onClose={() => { setCreating(false); setOpenTask(null); }}
        task={openTask}
        projectId={id}
        projects={[project]}
        users={project.members?.length ? project.members : users}
        onSaved={load}
      />
    </div>
  );
}
