import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, Button, Select } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/TaskModal';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '', priority: '', project: '', assignee: '' });
  const [openTask, setOpenTask] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    return api.get('/tasks', { params }).then(r => setTasks(r.data));
  };
  useEffect(() => { api.get('/projects').then(r => setProjects(r.data)).catch(() => {}); api.get('/users').then(r => setUsers(r.data)).catch(() => {}); }, []);
  useEffect(() => { load().catch(e => setError(e.response?.data?.message || 'Unable to load tasks')); }, [filters]);

  const remove = async (id) => { if (!window.confirm('Delete this task?')) return; try { await api.delete(`/tasks/${id}`); load(); } catch (e) { setError(e.response?.data?.message || 'Unable to delete task'); } };
  const updateStatus = async (id, status) => { try { await api.put(`/tasks/${id}`, { status }); load(); } catch (e) { setError(e.response?.data?.message || 'Unable to update task'); } };
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="space-y-5">
      <div className="page-header"><div><h1>Tasks</h1><p className="muted">View and update tasks across your projects.</p></div><Button onClick={() => setOpenTask({ __new: true })}>+ New task</Button></div>
      {error && <div className="form-error">{error}</div>}
      <Card className="filter-card"><div className="grid cols-4">
        <div><label>Search</label><input value={filters.q} onChange={set('q')} placeholder="Task title…" /></div>
        <div><label>Status</label><Select value={filters.status} onChange={set('status')}><option value="">All</option><option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="done">Done</option></Select></div>
        <div><label>Priority</label><Select value={filters.priority} onChange={set('priority')}><option value="">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></Select></div>
        <div><label>Project</label><Select value={filters.project} onChange={set('project')}><option value="">All</option>{projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</Select></div>
      </div></Card>
      <Card className="table-card"><table><thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
        {tasks.map(t => <tr key={t._id}><td><button className="table-title-button" onClick={() => setOpenTask(t)}>{t.title}</button></td><td>{t.project?.name || '—'}</td><td>{t.assignee?.name || 'Unassigned'}</td><td><span className="badge">{t.priority}</span></td><td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td><td><Select value={t.status} disabled={!(user?.role === "admin" || user?.role === "manager" || t.assignee?._id === user?.id || t.assignee?._id === user?._id || t.createdBy === user?.id || t.createdBy === user?._id)} onChange={e => updateStatus(t._id, e.target.value)} className="status-select"><option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="done">Done</option></Select></td><td className="row"><Button variant="outline" onClick={() => setOpenTask(t)}>Edit</Button><Button variant="danger" onClick={() => remove(t._id)}>Delete</Button></td></tr>)}
        {!tasks.length && <tr><td colSpan={7} className="muted">No tasks found.</td></tr>}
      </tbody></table></Card>
      {openTask && <TaskModal open onClose={() => setOpenTask(null)} task={openTask.__new ? null : openTask} projectId={openTask.__new ? "" : (openTask.project?._id || openTask.project)} projects={projects} users={users} onSaved={load} />}
    </div>
  );
}
