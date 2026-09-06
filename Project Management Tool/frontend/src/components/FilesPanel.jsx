import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { Card, Button } from "./ui";
import { Upload, FileIcon, Trash2 } from "lucide-react";

export default function FilesPanel({ projectId, taskId }) {
  const [files, setFiles] = useState([]);
  const inputRef = useRef();
  const endpoint = taskId ? `task/${taskId}` : `project/${projectId}`;

  const load = () => api.get(`/uploads/${endpoint}`).then((r) => setFiles(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [endpoint]);

  const upload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    await api.post(`/uploads/${endpoint}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    load();
  };
  const remove = async (id) => { await api.delete(`/uploads/${id}`); load(); };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Files</h3>
        <Button onClick={() => inputRef.current?.click()}><Upload size={14} className="inline mr-1" /> Upload</Button>
        <input ref={inputRef} type="file" className="hidden" onChange={upload} />
      </div>
      {files.length === 0 ? (
        <p className="text-sm text-gray-500">No files yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {files.map((f) => (
            <div key={f._id} className="flex items-center justify-between p-3 rounded-lg bg-bg-soft border border-border">
              <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 min-w-0 text-sm text-gray-100 hover:text-brand-soft">
                <FileIcon size={16} className="text-brand-soft shrink-0" />
                <span className="truncate">{f.originalName}</span>
                <span className="text-[10px] text-gray-500 shrink-0">{Math.round(f.size / 1024)} KB</span>
              </a>
              <button onClick={() => remove(f._id)} className="text-gray-500 hover:text-danger"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
