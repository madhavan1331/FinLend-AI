import { useState } from "react";

export function Field({ label, type = "text", name, value, onChange, onBlur, errors = {}, placeholder, className = "", disabled }) {
  const err = errors[name];
  const valid = value && !err;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <div className="relative">
        <input type={type} name={name} value={value} onChange={onChange} onBlur={onBlur}
          placeholder={placeholder || label} disabled={disabled}
          className={`w-full p-3.5 border-2 rounded-xl outline-none transition-all duration-200 text-sm
            ${err ? "border-red-400 bg-red-50" : valid ? "border-green-400 bg-green-50" : "border-slate-200 bg-white focus:border-blue-400"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} />
        {valid && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>}
      </div>
      {err && <p className="text-red-500 text-xs">{err}</p>}
    </div>
  );
}

export function SelectField({ label, name, value, onChange, options, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <select name={name} value={value} onChange={onChange}
        className="w-full p-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function InfoBox({ type = "info", children, className = "" }) {
  const s = {
    info:    "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    error:   "bg-red-50 border-red-200 text-red-700",
  };
  const icons = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };
  return (
    <div className={`flex gap-3 p-4 rounded-xl border text-sm ${s[type]} ${className}`}>
      <span className="shrink-0">{icons[type]}</span><div>{children}</div>
    </div>
  );
}

export function DocUpload({ label, name, uploaded, onUpload, required = true }) {
  const done = uploaded[name];
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all
      ${done ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{done ? "✅" : "📄"}</span>
        <div>
          <p className="text-sm font-semibold text-slate-700">{label} {required && <span className="text-red-400 text-xs">*</span>}</p>
          <p className="text-xs text-slate-400">{done ? "Uploaded successfully" : "PDF / JPG / PNG — max 5 MB"}</p>
        </div>
      </div>
      <label className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
        ${done ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
        {done ? "Re-upload" : "Upload"}
        <input type="file" className="hidden" onChange={() => onUpload(name)} />
      </label>
    </div>
  );
}

export function ReviewSection({ title, fields, onEdit }) {
  return (
    <div className="mb-4 border border-slate-100 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5">
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <button onClick={onEdit} className="text-blue-600 text-xs font-semibold hover:underline">Edit</button>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-2.5">
        {fields.map(([k, v]) => (
          <div key={k}><p className="text-xs text-slate-400">{k}</p><p className="text-sm font-semibold text-slate-700 truncate">{v || "—"}</p></div>
        ))}
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

export function ProgressRing({ pct, size = 80, stroke = 8, color = "#2563eb", label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      {label && <span className="absolute text-xs font-bold text-slate-700">{label}</span>}
    </div>
  );
}