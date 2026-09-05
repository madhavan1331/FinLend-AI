import { useState, useRef, useEffect } from "react";
import { fmt } from "../utils/helpers";

// ── FEATURE 3: Dynamic Interest Rate ─────────────────────────────────────────
export function DynamicRateTracker({ currentRate, onTimePayments, totalPayments }) {
  const streakPct  = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;
  const nextRate   = currentRate > 10.5 ? currentRate - 0.5 : currentRate;
  const emissionsNeeded = 6 - (onTimePayments % 6);

  const milestones = [
    { emis: 0,  rate: 14,   label: "Start",        reached: true },
    { emis: 6,  rate: 13,   label: "6 EMIs",        reached: onTimePayments >= 6 },
    { emis: 12, rate: 12,   label: "12 EMIs",       reached: onTimePayments >= 12 },
    { emis: 18, rate: 11,   label: "18 EMIs",       reached: onTimePayments >= 18 },
    { emis: 24, rate: 10.5, label: "Gold 🏆",       reached: onTimePayments >= 24 },
  ];

  return (
    <div className="space-y-4">
      {/* Current rate banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
        <p className="text-green-100 text-xs font-semibold uppercase tracking-wide mb-1">Your Current Rate</p>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-5xl font-black">{currentRate}%</span>
            <span className="text-green-200 ml-1">p.a.</span>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-xs">Next milestone</p>
            <p className="text-white font-bold">{nextRate}% in {emissionsNeeded} EMIs</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-green-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${streakPct}%` }} />
        </div>
        <p className="text-green-200 text-xs mt-1">{onTimePayments} of {totalPayments} EMIs paid on time</p>
      </div>

      {/* Rate journey milestones */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-bold text-slate-700 mb-4">🎯 Your Rate Journey</p>
        <div className="relative">
          {/* connector line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200" />
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 border-2
                  ${m.reached ? "bg-green-500 border-green-500 text-white" : currentRate !== 14 && i === milestones.findIndex(x => !x.reached) ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-300 text-slate-400"}`}>
                  {m.reached ? "✓" : m.emis}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className={`text-sm font-semibold ${m.reached ? "text-green-700" : "text-slate-400"}`}>{m.label}</span>
                  <span className={`text-sm font-bold ${m.reached ? "text-green-600" : "text-slate-300"}`}>{m.rate}%</span>
                </div>
                {m.reached && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Unlocked</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        💡 Your rate automatically drops by 0.5% every 6 consecutive on-time EMIs — no paperwork needed.
      </div>
    </div>
  );
}

// ── FEATURE 4: Video KYC ──────────────────────────────────────────────────────
export function VideoKYC({ onComplete }) {
  const [stage,    setStage]    = useState("intro");   // intro|permission|recording|checks|done
  const [checks,   setChecks]   = useState({ face: false, blink: false, turn: false, lighting: false });
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setStage("recording");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      // Simulate liveness checks after 2s
      setTimeout(() => runLivenessChecks(stream), 2000);
    } catch {
      setStage("permission");
    }
  };

  const runLivenessChecks = (stream) => {
    setStage("checks");
    const checkList = ["face", "blink", "turn", "lighting"];
    checkList.forEach((c, i) => {
      setTimeout(() => {
        setChecks(p => ({ ...p, [c]: true }));
        setProgress((i + 1) * 25);
        if (i === checkList.length - 1) {
          setTimeout(() => {
            stream?.getTracks().forEach(t => t.stop());
            setStage("done");
            onComplete?.();
          }, 800);
        }
      }, (i + 1) * 1200);
    });
  };

  const checkLabels = {
    face:     "Face detected in frame",
    blink:    "Blink liveness check",
    turn:     "Head turn verification",
    lighting: "Lighting conditions OK",
  };

  if (stage === "intro") return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">🎥</div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">Video KYC Verification</h3>
      <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto leading-relaxed">
        We need to verify your identity with a quick 30-second video. You'll need to blink and turn your head slightly.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
        {[["📷","Front camera","Required"],["💡","Good lighting","Required"],["🤳","Hold steady","30 seconds"]].map(([icon,l,s]) => (
          <div key={l} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-xs font-bold text-slate-600">{l}</p>
            <p className="text-xs text-slate-400">{s}</p>
          </div>
        ))}
      </div>
      <button onClick={startCamera}
        className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
        Start Video KYC →
      </button>
      <p className="text-xs text-slate-400 mt-2">RBI-compliant · End-to-end encrypted</p>
    </div>
  );

  if (stage === "permission") return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">🚫</div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">Camera Access Denied</h3>
      <p className="text-sm text-slate-500 mb-4">Please allow camera access in your browser settings and try again.</p>
      <button onClick={() => setStage("intro")} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Try Again</button>
    </div>
  );

  if (stage === "recording" || stage === "checks") return (
    <div>
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 mb-4" style={{ aspectRatio: "4/3" }}>
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {/* Face guide oval */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-60 rounded-full border-4 border-blue-400 border-dashed opacity-70" />
        </div>
        {/* Status overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4">
          <p className="text-white text-sm font-semibold text-center">
            {stage === "recording" ? "Position your face in the oval..." : "Running liveness checks..."}
          </p>
          {stage === "checks" && (
            <div className="h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>

      {stage === "checks" && (
        <div className="space-y-2">
          {Object.entries(checks).map(([k, done]) => (
            <div key={k} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
              ${done ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0
                ${done ? "bg-green-500 text-white" : "bg-slate-200"}`}>
                {done ? "✓" : ""}
              </span>
              <span className={`text-sm font-medium ${done ? "text-green-700" : "text-slate-400"}`}>
                {checkLabels[k]}
              </span>
              {!done && <div className="ml-auto w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (stage === "done") return (
    <div className="text-center py-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
      <h3 className="text-2xl font-bold text-green-700 mb-2">Identity Verified!</h3>
      <p className="text-slate-500 text-sm">Video KYC completed successfully. All liveness checks passed.</p>
      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-700">
        🔒 Your video has been securely processed and deleted. Only the verification result is stored.
      </div>
    </div>
  );
}

// ── FEATURE 5: EMI Holiday ────────────────────────────────────────────────────
export function EMIHoliday({ emi, tenure, onTimePayments, holidayUsed, onRequestHoliday }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const eligible = onTimePayments >= 3 && !holidayUsed;

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className={`rounded-2xl p-5 border-2 ${eligible ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">🏖️</span>
          <div className="flex-1">
            <h3 className={`text-lg font-bold mb-1 ${eligible ? "text-blue-800" : "text-slate-500"}`}>EMI Holiday</h3>
            <p className={`text-sm leading-relaxed ${eligible ? "text-blue-700" : "text-slate-400"}`}>
              Skip one EMI payment this year with zero penalty. Your tenure extends by 1 month automatically.
            </p>
          </div>
        </div>

        {eligible ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[["EMI skipped","₹"+fmt(emi),"text-blue-700"],["Penalty","₹0","text-green-600"],["Extra tenure","1 month","text-orange-500"]].map(([l,v,c]) => (
                <div key={l} className="bg-white rounded-lg p-2.5 border border-blue-100">
                  <p className="text-slate-400 mb-0.5">{l}</p>
                  <p className={`font-bold ${c}`}>{v}</p>
                </div>
              ))}
            </div>
            {!showConfirm ? (
              <button onClick={() => setShowConfirm(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                Request EMI Holiday for Next Month
              </button>
            ) : (
              <div className="bg-white border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-bold text-slate-700 mb-2">Confirm EMI Holiday?</p>
                <p className="text-xs text-slate-500 mb-3">Your next EMI of ₹{fmt(emi)} will be skipped. Tenure extends by 1 month. You can use this once per year.</p>
                <div className="flex gap-2">
                  <button onClick={() => { onRequestHoliday?.(); setShowConfirm(false); }}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Yes, Skip EMI</button>
                  <button onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3">
            {holidayUsed
              ? <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-500 text-center">✓ EMI Holiday used this year. Available again next year.</div>
              : <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-500 text-center">⏳ Pay {3 - onTimePayments} more EMIs on time to unlock EMI Holiday.</div>
            }
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-700">
        ℹ️ EMI Holiday is available once per year after 3 consecutive on-time payments. Interest continues to accrue on the outstanding principal during the holiday month.
      </div>
    </div>
  );
}