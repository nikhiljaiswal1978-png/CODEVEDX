import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { Card, Input, Button } from "./ui";
import { Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function ChatPanel({ projectId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    api.get(`/messages/project/${projectId}`).then((r) => setMessages(r.data));
    const s = getSocket();
    const onNew = (m) => { if (m.project === projectId) setMessages((prev) => [...prev, m]); };
    s.on("chat:new", onNew);
    return () => s.off("chat:new", onNew);
  }, [projectId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    getSocket().emit("chat:send", { projectId, text });
    setText("");
  };

  return (
    <Card className="p-0 flex flex-col h-[560px]">
      <div className="p-4 border-b border-border font-semibold text-white">Project Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const mine = m.sender?._id === user?.id || m.sender?._id === user?._id;
          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? "bg-brand text-white" : "bg-bg-soft border border-border text-gray-100"}`}>
                {!mine && <div className="text-[10px] text-brand-soft font-semibold mb-0.5">{m.sender?.name}</div>}
                <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                <div className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
        <Button type="submit"><Send size={14} /></Button>
      </form>
    </Card>
  );
}
