import React from "react";

export const Card = ({ className = "", children, ...p }) => (
  <div className={`rounded-xl border border-border bg-bg-card ${className}`} {...p}>{children}</div>
);

export const Button = ({ variant = "primary", className = "", ...p }) => {
  const styles = {
    primary: "bg-brand hover:bg-brand-deep text-white shadow-glow",
    ghost: "bg-bg-hover hover:bg-border text-gray-200",
    danger: "bg-danger/80 hover:bg-danger text-white",
    outline: "border border-border text-gray-200 hover:bg-bg-hover",
  }[variant];
  return <button {...p} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${styles} ${className}`} />;
};

export const Input = (p) => (
  <input
    {...p}
    className={`w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand ${p.className || ""}`}
  />
);

export const Select = ({ children, ...p }) => (
  <select
    {...p}
    className={`w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-gray-100 focus:outline-none focus:border-brand ${p.className || ""}`}
  >
    {children}
  </select>
);

export const Textarea = (p) => (
  <textarea
    {...p}
    className={`w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand ${p.className || ""}`}
  />
);

export const Badge = ({ tone = "default", children }) => {
  const tones = {
    default: "bg-bg-hover text-gray-300",
    info: "bg-info/15 text-info border border-info/30",
    ok: "bg-ok/15 text-ok border border-ok/30",
    warn: "bg-warn/15 text-warn border border-warn/30",
    danger: "bg-danger/15 text-danger border border-danger/30",
    brand: "bg-brand/15 text-brand-soft border border-brand/30",
  };
  return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide rounded ${tones[tone]}`}>{children}</span>;
};

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const statusTone = (s) => ({ todo: "default", "in-progress": "info", review: "warn", done: "ok" }[s] || "default");
export const priorityTone = (p) => ({ low: "default", medium: "info", high: "warn", urgent: "danger" }[p] || "default");
