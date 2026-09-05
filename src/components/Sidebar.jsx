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
    <div className={`w-52 fixed h-full shadow-2xl flex flex-col overflow-y-auto z-10 transition-colors
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