import { ProgressRing } from "./ui";

const getScoreColor  = (s) => s >= 75 ? "#16a34a" : s >= 50 ? "#ca8a04" : "#dc2626";
const getScoreLabel  = (s) => s >= 75 ? "Excellent" : s >= 60 ? "Good" : s >= 45 ? "Fair" : "Needs Work";
const getScoreGrade  = (s) => s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : "D";

export function FinancialHealthScore({ score, cibilScore, income, emi, streak }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const grade = getScoreGrade(score);

  const factors = [
    { label: "Credit Score",       value: cibilScore >= 750 ? "Excellent" : cibilScore >= 650 ? "Fair" : "Poor",   pct: Math.round(((cibilScore-300)/600)*100), color: cibilScore >= 750 ? "bg-green-500" : cibilScore >= 650 ? "bg-yellow-500" : "bg-red-500" },
    { label: "Income vs EMI",      value: income > 0 ? `${Math.round((emi/income)*100)}% of income` : "N/A",        pct: income > 0 ? Math.max(0,100-Math.round((emi/income)*100*2)) : 50, color: (emi/income) < 0.3 ? "bg-green-500" : "bg-yellow-500" },
    { label: "Payment Streak",     value: `${streak} on-time`,   pct: Math.min(100, streak * 10),  color: streak >= 6 ? "bg-green-500" : "bg-yellow-500" },
  ];

  const tips = score < 50
    ? ["Improve CIBIL score by clearing dues", "Reduce EMI burden — consider a longer tenure", "Make all payments on time"]
    : score < 75
    ? ["Keep paying EMIs on time to build streak", "Consider prepaying to reduce interest", "Keep credit utilisation below 30%"]
    : ["Great financial health! You qualify for the best rates", "Maintain your streak to unlock Gold Borrower status"];

  return (
    <div className="space-y-5">
      {/* Hero score card */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">FinScore™</p>
            <div className="flex items-end gap-2">
              <span className="text-7xl font-black leading-none">{score}</span>
              <span className="text-2xl font-bold text-blue-200 mb-1">/100</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold">{label}</span>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">Grade {grade}</span>
            </div>
            <p className="text-blue-200 text-xs mt-2">Updates every week based on your behaviour</p>
          </div>
          <ProgressRing pct={score} size={96} stroke={10} color="#ffffff" label={`${score}`} />
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <div className="mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-xs font-bold">{streak}-Month Streak!</p>
              <p className="text-xs text-blue-200">Keep paying on time to unlock better rates</p>
            </div>
          </div>
        )}
      </div>

      {/* Score factors */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-700 mb-4">What makes up your score</p>
        <div className="space-y-4">
          {factors.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">{f.label}</span>
                <span className="text-slate-400">{f.value}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${f.color}`} style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unlock next level */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🏆</span>
          <p className="text-sm font-bold text-amber-800">
            {score >= 75 ? "Gold Borrower — Unlocked!" : `${75 - score} points to Gold Borrower`}
          </p>
        </div>
        <div className="h-2 bg-amber-200 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (score / 75) * 100)}%` }} />
        </div>
        <p className="text-xs text-amber-700">Gold unlocks: 0.5% rate reduction · Higher loan limit · Priority support</p>
      </div>

      {/* Tips */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs font-bold text-slate-600 mb-2">💡 Personalised Tips</p>
        {tips.map((t, i) => (
          <p key={i} className="text-xs text-slate-500 mb-1">• {t}</p>
        ))}
      </div>
    </div>
  );
}