import { useState, useEffect } from "react";

// ── FEATURE 1: Persistent Dark Mode ─────────────────────────────────────────
// Reads/writes to localStorage so it survives page refresh
export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("finlend_dark") === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("finlend_dark", darkMode); }
    catch {}
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return [darkMode, setDarkMode];
}

// ── FEATURE 2: Mobile Bottom Navigation ─────────────────────────────────────
// Shows on screens < md. Replaces sidebar on mobile.
const MOBILE_NAV = [
  { step: 1,  icon: "⚙️",  label: "Config"   },
  { step: 3,  icon: "📊", label: "CIBIL"    },
  { step: 5,  icon: "💰", label: "Income"   },
  { step: 8,  icon: "📁", label: "Docs"     },
  { step: 13, icon: "🎉", label: "Dashboard" },
];

export function MobileBottomNav({ step, setStep, darkMode }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t flex items-center justify-around px-2 py-2
      ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-slate-200"}`}>
      {MOBILE_NAV.map((n) => {
        const active  = step === n.step;
        const done    = step > n.step;
        return (
          <button key={n.step} onClick={() => setStep(n.step)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all
              ${active ? "text-blue-600" : done ? "text-green-500" : darkMode ? "text-gray-500" : "text-slate-400"}`}>
            <span className="text-xl">{done && !active ? "✓" : n.icon}</span>
            <span className="text-xs font-semibold">{n.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Responsive Sidebar (hidden on mobile, shown on md+) ─────────────────────
export const STEPS = [
  { id: 0,  label: "OTP Login",     icon: "🔑", group: "auth" },
  { id: 1,  label: "Loan Config",   icon: "⚙️",  group: "apply" },
  { id: 2,  label: "Personal Info", icon: "👤", group: "apply" },
  { id: 3,  label: "CIBIL Check",   icon: "📊", group: "apply" },
  { id: 4,  label: "Employment",    icon: "💼", group: "apply" },
  { id: 5,  label: "Income",        icon: "💰", group: "apply" },
  { id: 6,  label: "Address",       icon: "🏠", group: "apply" },
  { id: 7,  label: "Bank",          icon: "🏦", group: "apply" },
  { id: 8,  label: "Documents",     icon: "📁", group: "apply" },
  { id: 9,  label: "Video KYC",     icon: "🎥", group: "apply" },
  { id: 10, label: "E-Sign",        icon: "✍️",  group: "finalize" },
  { id: 11, label: "NACH Mandate",  icon: "🔁", group: "finalize" },
  { id: 12, label: "Review",        icon: "🔍", group: "finalize" },
  { id: 13, label: "Dashboard",     icon: "🎉", group: "done" },
];

export function Sidebar({ step, darkMode }) {
  const groups = {
    auth:     { label: "Login",       ids: [0] },
    apply:    { label: "Application", ids: [1,2,3,4,5,6,7,8,9] },
    finalize: { label: "Finalise",    ids: [10,11,12] },
    done:     { label: "Complete",    ids: [13] },
  };

  return (
    <div className={`hidden md:flex w-52 fixed h-full shadow-2xl flex-col overflow-y-auto z-10 transition-colors
      ${darkMode ? "bg-gray-900 text-white" : "bg-[#182866] text-white"}`}>
      <div className="p-5 border-b border-white/10">
        <h1 className="text-xl font-bold">FinLend AI</h1>
        <p className="text-xs text-slate-300 mt-0.5">Smart Personal Loan Platform</p>
      </div>
      <div className="p-3 flex-1">
        {Object.entries(groups).map(([gKey, g]) => (
          <div key={gKey} className="mb-3">
            <p className="text-xs text-white/30 uppercase tracking-widest px-2 mb-1.5">{g.label}</p>
            {STEPS.filter(s => g.ids.includes(s.id)).map(s => {
              const done   = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 transition-all duration-200
                  ${active ? "bg-blue-600 shadow-lg" : done ? "bg-white/10" : "opacity-40"}`}>
                  <span className="text-sm">{done ? "✓" : s.icon}</span>
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile Top Header (shown only on small screens) ──────────────────────────
export function MobileHeader({ step, darkMode, setDarkMode }) {
  const current = STEPS.find(s => s.id === step);
  return (
    <div className={`md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 border-b
      ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
      <div className="flex items-center gap-2">
        <span className="text-blue-600 font-black text-lg">FL</span>
        <span className="text-xs font-semibold text-slate-400">{current?.icon} {current?.label}</span>
      </div>
      <button onClick={() => setDarkMode(d => !d)}
        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold ${darkMode ? "border-gray-600 text-gray-300" : "border-slate-200 text-slate-500"}`}>
        {darkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
}