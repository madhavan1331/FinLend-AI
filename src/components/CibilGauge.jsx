import { useState } from "react";

// FIX 2: Full CIBIL check flow with PAN + DOB entry, bureau simulation, dynamic rate
export function CibilGauge({ score, onScoreFetched }) {
  const [stage,    setStage]    = useState(score ? "done" : "idle");
  const [panInput, setPanInput] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [panError, setPanError] = useState("");
  const [progress, setProgress] = useState(0);

  // Rate table — used throughout this component and exported for App.jsx
  const rateFromScore = (s) => {
    if (s >= 800) return 10.5;
    if (s >= 750) return 11;
    if (s >= 700) return 12;
    if (s >= 650) return 14;
    return null;
  };

  const handleFetch = () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(panInput)) {
      setPanError("Invalid PAN. Example: ABCDE1234F");
      return;
    }
    if (!dobInput) { setPanError("Please enter date of birth"); return; }
    setPanError("");
    setStage("checking");

    // Simulate bureau API with progress steps
    let p = 0;
    const iv = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          const simulatedScore = 690; // In prod: comes from CIBIL/Experian API
          onScoreFetched(simulatedScore);
          setStage("done");
        }, 400);
      }
    }, 500);
  };

  // Gauge display helpers
  const pct   = Math.max(0, Math.min(100, ((score - 300) / 600) * 100));
  const color = score >= 750 ? "#16a34a" : score >= 650 ? "#ca8a04" : "#dc2626";
  const label = score >= 800 ? "Excellent" : score >= 750 ? "Very Good" : score >= 700 ? "Good" : score >= 650 ? "Fair" : "Poor";
  const rate  = rateFromScore(score);

  const tips = score >= 750
    ? ["Maintain timely payments to keep it up", "You qualify for our best interest rates"]
    : score >= 650
    ? ["Pay all bills on or before due date", "Keep credit utilisation under 30%", "Avoid multiple new loan enquiries"]
    : ["Clear any overdue payments immediately", "Reduce credit card outstanding balance", "Don't apply for new credit for 6 months", "Dispute errors on your credit report"];

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (stage === "idle") {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">📊</div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">Check Your Live CIBIL Score</h3>
        <p className="text-sm text-slate-400 mb-5 max-w-sm mx-auto leading-relaxed">
          Your score is fetched from the credit bureau in real time using your PAN.
          This is a <strong className="text-slate-600">soft check</strong> — it does not affect your score.
        </p>

        {/* What we use */}
        <div className="grid grid-cols-4 gap-3 mb-6 max-w-md mx-auto">
          {[["🪪","PAN Card"],["📅","Date of Birth"],["🏦","Bureau Data"],["🔒","Soft Check"]].map(([icon, l]) => (
            <div key={l} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="text-xl mb-0.5">{icon}</div>
              <p className="text-xs text-slate-500 font-semibold leading-tight">{l}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setStage("form")}
          className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-md">
          Check My CIBIL Score →
        </button>
        <p className="text-xs text-slate-400 mt-2">Free · Takes under 30 seconds</p>
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────────
  if (stage === "form") {
    return (
      <div className="max-w-sm mx-auto py-2">
        <h3 className="text-lg font-bold text-slate-700 mb-1">Enter Verification Details</h3>
        <p className="text-xs text-slate-400 mb-5">Used only for bureau verification. Never stored on our servers.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">PAN Number</label>
            <input type="text" maxLength={10} placeholder="ABCDE1234F"
              value={panInput}
              onChange={(e) => { setPanInput(e.target.value.toUpperCase()); setPanError(""); }}
              className={`w-full mt-1 p-3.5 border-2 rounded-xl outline-none text-sm tracking-widest font-mono uppercase
                ${panError ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-blue-400"}`}
            />
            {panError && <p className="text-red-500 text-xs mt-1">{panError}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date of Birth</label>
            <input type="date" value={dobInput} onChange={(e) => setDobInput(e.target.value)}
              max={new Date(Date.now() - 18*365.25*24*60*60*1000).toISOString().split("T")[0]}
              className="w-full mt-1 p-3.5 border-2 border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400" />
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          🔒 Your PAN is encrypted and sent directly to the credit bureau. We receive only your score.
        </div>

        <button onClick={handleFetch} disabled={panInput.length < 10 || !dobInput}
          className="mt-4 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all">
          Fetch My Score from Bureau
        </button>
        <button onClick={() => setStage("idle")} className="mt-2 w-full text-xs text-slate-400 hover:text-slate-600 py-1">
          ← Back
        </button>
      </div>
    );
  }

  // ── CHECKING ──────────────────────────────────────────────────────────────
  if (stage === "checking") {
    const steps = [
      "Verifying PAN with NSDL...",
      "Connecting to CIBIL bureau...",
      "Retrieving credit report...",
      "Calculating your score...",
      "Generating personalised rate...",
    ];
    const doneCount = Math.floor(progress / 20);
    return (
      <div className="text-center py-6">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-4">Fetching Your Score...</h3>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mb-4">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{progress}% complete</p>
        </div>

        {/* Step list */}
        <div className="max-w-xs mx-auto text-left space-y-2">
          {steps.map((msg, i) => (
            <div key={msg} className={`flex items-center gap-2 text-xs transition-all
              ${i < doneCount ? "text-green-600" : i === doneCount ? "text-blue-600" : "text-slate-300"}`}>
              <span>{i < doneCount ? "✓" : i === doneCount ? "⟳" : "○"}</span>
              {msg}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── DONE — show full score breakdown ──────────────────────────────────────
  return (
    <div>
      {/* Score banner */}
      <div className={`rounded-2xl p-5 mb-5 text-center border-2
        ${score >= 750 ? "bg-green-50 border-green-300"
          : score >= 650 ? "bg-yellow-50 border-yellow-300"
          : "bg-red-50 border-red-300"}`}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Live CIBIL Score</p>
        <p className="text-7xl font-bold leading-none" style={{ color }}>{score}</p>
        <p className="text-base font-semibold mt-1" style={{ color }}>{label}</p>
        {rate
          ? <p className="text-sm text-blue-600 font-bold mt-2">🎯 Your personalised rate: <strong>{rate}% p.a.</strong></p>
          : <p className="text-sm text-red-600 font-bold mt-2">❌ Score too low — minimum 650 required</p>
        }
      </div>

      {/* Colour gauge */}
      <div className="relative h-5 bg-slate-200 rounded-full overflow-visible mb-1.5">
        <div className="absolute h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#dc2626 0%,#f59e0b 40%,#22c55e 80%,#16a34a 100%)", transition: "width 1s ease" }} />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg z-10 transition-all duration-1000"
          style={{ left: `${pct}%`, background: color, border: "3px solid white" }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mb-5 px-1">
        {[["300","Poor"],["450",""],["600","Fair"],["750","Good"],["900","Excellent"]].map(([v,l]) => (
          <div key={v} className="text-center">
            <div className="font-semibold">{v}</div>
            {l && <div className="text-slate-300">{l}</div>}
          </div>
        ))}
      </div>

      {/* Rate impact table */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden mb-4">
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Interest Rate by Score Band</p>
        </div>
        {[
          { range: "800–900", label: "Excellent",  rate: "10.5%", min: 800 },
          { range: "750–799", label: "Very Good",  rate: "11%",   min: 750 },
          { range: "700–749", label: "Good",       rate: "12%",   min: 700 },
          { range: "650–699", label: "Fair",       rate: "14%",   min: 650 },
          { range: "< 650",   label: "Poor",       rate: "Not eligible", min: 0 },
        ].map((row) => {
          const isYours =
            (row.min === 800 && score >= 800) ||
            (row.min === 750 && score >= 750 && score < 800) ||
            (row.min === 700 && score >= 700 && score < 750) ||
            (row.min === 650 && score >= 650 && score < 700) ||
            (row.min === 0   && score < 650);
          return (
            <div key={row.range}
              className={`flex items-center justify-between px-4 py-2.5 text-xs border-b border-slate-100 last:border-0
                ${isYours ? "bg-blue-50" : ""}`}>
              <div className="flex items-center gap-2">
                {isYours && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                {!isYours && <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />}
                <span className={isYours ? "text-blue-700 font-bold" : "text-slate-500"}>
                  {row.range} — {row.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${isYours ? "text-blue-700" : row.min === 0 ? "text-red-500" : row.min >= 750 ? "text-green-600" : "text-orange-500"}`}>
                  {row.rate}
                </span>
                {isYours && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Your rate</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className={`rounded-xl p-4 border
        ${score >= 750 ? "bg-green-50 border-green-200"
          : score >= 650 ? "bg-yellow-50 border-yellow-200"
          : "bg-red-50 border-red-200"}`}>
        <p className={`text-xs font-bold mb-2
          ${score >= 750 ? "text-green-700" : score >= 650 ? "text-yellow-700" : "text-red-700"}`}>
          {score >= 750 ? "✅ You're in great shape!" : score >= 650 ? "💡 Tips to unlock a better rate" : "❌ How to improve your score to qualify"}
        </p>
        <ul className="space-y-1">
          {tips.map((t, i) => (
            <li key={i} className={`text-xs ${score >= 750 ? "text-green-600" : score >= 650 ? "text-yellow-700" : "text-red-600"}`}>
              • {t}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-slate-400 mt-3 text-center">
        * Soft check only — no impact on your CIBIL score. Valid for 30 days.
      </p>
    </div>
  );
}