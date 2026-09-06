import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, Button, Modal, Input, Textarea, Select } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

const EMPTY = { name: '', description: '', status: 'active', startDate: '', endDate: '', color: '#6366f1', members: [] };

export default function Projects() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "manager";
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/projects').then(r => setProjects(r.data));
  useEffect(() => { load().catch(() => setError('Unable to load projects')); api.get('/users').then(r => setUsers(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setOpen(true); };
  const openEdit = (p) => {
    setEditing(p); setForm({
      name: p.name || '', description: p.description || '', status: p.status || 'active',
      startDate: p.startDate ? p.startDate.slice(0, 10) : '', endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      color: p.color || '#6366f1', members: (p.members || []).map(m => m._id),
    }); setError(''); setOpen(true);
  };
  const save = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await api.put(`/projects/${editing._id}`, form);
      else await api.post('/projects', form);
      setOpen(false); await load();
    } catch (e) { setError(e.response?.data?.message || 'Unable to save project'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this project and its tasks?')) return;
    try { await api.delete(`/projects/${id}`); load(); } catch (e) { setError(e.response?.data?.message || 'Unable to delete project'); }
  };

  return (
    <div className="space-y-5">
      <div className="page-header"><div><h1>Projects</h1><p className="muted">Create projects, assign team members and track progress.</p></div>{canManage && <Button onClick={openCreate}>+ New project</Button>}</div>
      {error && <div className="form-error">{error}</div>}
      <Card className="table-card">
        <table><thead><tr><th>Name</th><th>Status</th><th>Progress</th><th>Dates</th><th>Owner</th><th></th></tr></thead>
          <tbody>{projects.map(p => <tr key={p._id}>
            <td><Link to={`/projects/${p._id}`} className="table-link">{p.name}</Link></td>
            <td><span className="badge">{p.status}</span></td>
            <td>{p.progress ?? 0}% ({p.doneCount ?? 0}/{p.taskCount ?? 0})</td>
            <td>{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'} → {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}</td>
            <td>{p.owner?.name || '—'}</td>
            <td className="row">{canManage && <><Button variant="outline" onClick={() => openEdit(p)}>Edit</Button><Button variant="danger" onClick={() => remove(p._id)}>Delete</Button></>}</td>
          </tr>)}{!projects.length && <tr><td colSpan={6} className="muted">No projects yet.</td></tr>}</tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Project' : 'New Project'}>
        <form onSubmit={save} className="space-y-3">
          <Input required placeholder="Project name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea rows={3} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="on-hold">On Hold</option><option value="completed">Completed</option><option value="archived">Archived</option></Select><Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3"><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
          <label>Members</label><select multiple value={form.members} onChange={e => setForm({ ...form, members: Array.from(e.target.selectedOptions, o => o.value) })} className="member-select">{users.map(u => <option key={u._id} value={u._id}>{u.name} · {u.role}</option>)}</select>
          {error && <p className="form-error">{error}</p>}
          <Button type="submit">{editing ? 'Save changes' : 'Create project'}</Button>
        </form>
      </Modal>
    </div>
  );
}
