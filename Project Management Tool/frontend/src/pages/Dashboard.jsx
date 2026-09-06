import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const COLORS = ['#8b5cf6', '#22c55e', '#f59e0b', '#06b6d4', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard/stats').then(r => setStats(r.data)).catch(e => setError(e.response?.data?.message || 'Unable to load dashboard')); }, []);
  if (error) return <div className="card"><h2>Dashboard unavailable</h2><p className="muted">{error}</p></div>;
  if (!stats) return <p className="muted">Loading dashboard…</p>;

  const pieData = [
    { name: 'Completed', value: stats.completedTasks }, { name: 'In Progress', value: stats.inProgressTasks },
    { name: 'Review', value: stats.reviewTasks }, { name: 'To Do', value: stats.pendingTasks }, { name: 'Overdue', value: stats.overdueTasks },
  ];
  const barData = [{ name: 'Projects', count: stats.totalProjects }, { name: 'Tasks', count: stats.totalTasks }, { name: 'Completed', count: stats.completedTasks }, { name: 'To Do', count: stats.pendingTasks }, { name: 'Overdue', count: stats.overdueTasks }];
  return <div className="space-y-5"><div className="page-header"><div><h1>Dashboard</h1><p className="muted">A live overview of your project workspace.</p></div></div>
    <div className="grid cols-4"><StatCard label="Total Projects" value={stats.totalProjects} /><StatCard label="Total Tasks" value={stats.totalTasks} /><StatCard label="Completed" value={stats.completedTasks} /><StatCard label="Overdue" value={stats.overdueTasks} /></div>
    <div className="card"><div className="progress-header"><h3>Overall progress</h3><strong>{stats.progressPercentage}%</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${stats.progressPercentage}%` }} /></div></div>
    <div className="grid cols-2"><div className="card"><h3>Task Status</h3><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div><div className="card"><h3>Overview</h3><ResponsiveContainer width="100%" height={280}><BarChart data={barData}><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#8b5cf6" /></BarChart></ResponsiveContainer></div></div>
  </div>;
}
function StatCard({ label, value }) { return <div className="card"><div className="muted" style={{ fontSize: 12 }}>{label}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div></div>; }
