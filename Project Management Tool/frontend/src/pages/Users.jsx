import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, Select, Button } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const load = () => api.get("/users").then((r) => setUsers(r.data));
  useEffect(() => { if (user?.role === "admin") load(); }, [user]);
  if (user?.role !== "admin") return <Card><h2>Access denied</h2><p className="muted">Only administrators can manage users.</p></Card>;
  const setRole = async (id, role) => { await api.put(`/users/${id}`, { role }); load(); };
  const remove = async (id) => { if (!window.confirm("Delete user?")) return; await api.delete(`/users/${id}`); load(); };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-gray-400 text-xs uppercase">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-border hover:bg-bg-hover">
                <td className="px-4 py-3 text-white">{u.name}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <Select value={u.role} onChange={(e) => setRole(u._id, e.target.value)} className="max-w-[140px]">
                    {["admin","manager","employee"].map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </td>
                <td className="px-4 py-3 text-right">
                  {u._id !== (user?.id || user?._id) && <Button variant="danger" onClick={() => remove(u._id)}>Delete</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
