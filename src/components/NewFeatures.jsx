import { useState } from "react";
import { fmt } from "../utils/helpers";

// ── FEATURE 5: Credit Score History Chart ────────────────────────────────────
const MOCK_HISTORY = [
  { month: "Jan", score: 640 },
  { month: "Feb", score: 650 },
  { month: "Mar", score: 658 },
  { month: "Apr", score: 670 },
  { month: "May", score: 680 },
  { month: "Jun", score: 690 },
];

function ScorePoint({ score, month, x, y, isLast, darkMode }) {
  const color = score >= 750 ? "#16a34a" : score >= 650 ? "#ca8a04" : "#dc2626";
  return (
    <g>
      <circle cx={x} cy={y} r={isLast ? 7 : 5} fill={color} stroke="white" strokeWidth={2} />
      {isLast && <circle cx={x} cy={y} r={12} fill={color} fillOpacity={0.2} />}
      <text x={x} y={y - 14} textAnchor="middle" fontSize={9} fill={isLast ? color : "#94a3b8"} fontWeight={isLast ? "700" : "400"}>
        {score}
      </text>
      <text x={x} y={145} textAnchor="middle" fontSize={9} fill="#94a3b8">{month}</text>
    </g>
  );
}

export function CreditScoreHistory({ currentScore }) {
  const history = [...MOCK_HISTORY.slice(0, -1), { month: "Jun", score: currentScore || 690 }];
  const minScore = Math.min(...history.map(h => h.score)) - 20;
  const maxScore = Math.max(...history.map(h => h.score)) + 20;
  const range    = maxScore - minScore;
  const W = 360, H = 140, padX = 30, padY = 15;
  const graphW = W - padX * 2;
  const graphH = H - padY * 2;

  const points = history.map((h, i) => ({
    ...h,
    x: padX + (i / (history.length - 1)) * graphW,
    y: padY + graphH - ((h.score - minScore) / range) * graphH,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const area     = `${points[0].x},${H} ${polyline} ${points[points.length-1].x},${H}`;

  const change = history[history.length-1].score - history[0].score;
  const changeColor = change >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="space-y-4">
      {/* Score trend banner */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-black text-slate-800">{currentScore || 690}</p>
          <p className="text-xs text-slate-400">Current CIBIL Score</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${changeColor}`}>{change >= 0 ? "+" : ""}{change} pts</p>
          <p className="text-xs text-slate-400">Last 6 months</p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = padY + t * graphH;
            const score = Math.round(maxScore - t * range);
            return (
              <g key={i}>
                <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,4" />
                <text x={0} y={y + 4} fontSize={8} fill="#cbd5e1">{score}</text>
              </g>
            );
          })}
          {/* Area fill */}
          <polygon points={area} fill="url(#scoreGrad)" opacity={0.3} />
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Line */}
          <polyline points={polyline} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {/* Points */}
          {points.map((p, i) => (
            <ScorePoint key={i} {...p} isLast={i === points.length - 1} />
          ))}
        </svg>
      </div>

      {/* Rate impact */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-700 mb-2">📈 Score impact on your rate</p>
        <div className="space-y-1.5">
          {[
            { range: "750+", rate: "10.5–11%", current: currentScore >= 750 },
            { range: "700–749", rate: "12%", current: currentScore >= 700 && currentScore < 750 },
            { range: "650–699", rate: "14%", current: currentScore >= 650 && currentScore < 700 },
          ].map(row => (
            <div key={row.range} className={`flex justify-between text-xs px-3 py-2 rounded-lg ${row.current ? "bg-blue-600 text-white font-bold" : "text-blue-700"}`}>
              <span>Score {row.range}</span>
              <span>{row.rate} {row.current ? "← You" : ""}</span>
            </div>
          ))}
        </div>
        {currentScore < 750 && (
          <p className="text-xs text-blue-600 mt-2">🎯 Improve by {750 - currentScore} points to unlock 10.5% rate</p>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs font-bold text-slate-600 mb-2">What improved your score</p>
        {[["On-time EMI payments", "+15 pts"], ["Reduced credit utilisation", "+10 pts"], ["No new loan enquiries", "+5 pts"]].map(([k,v]) => (
          <div key={k} className="flex justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-slate-500">{k}</span>
            <span className="text-green-600 font-bold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FEATURE 6: Loan Insurance / Credit Protect ───────────────────────────────
const PLANS = [
  {
    id: "basic",
    name: "Basic Shield",
    icon: "🛡️",
    premium: 299,
    premiumNote: "/month",
    color: "border-slate-300",
    headerBg: "bg-slate-50",
    covers: [
      { label: "Job Loss Cover",        covered: true,  detail: "3 EMIs covered" },
      { label: "Accidental Disability", covered: true,  detail: "Full outstanding" },
      { label: "Critical Illness",      covered: false, detail: "Not included" },
      { label: "Death Benefit",         covered: true,  detail: "Full outstanding" },
    ],
  },
  {
    id: "premium",
    name: "Premium Shield",
    icon: "⭐",
    premium: 599,
    premiumNote: "/month",
    color: "border-blue-500",
    headerBg: "bg-blue-600",
    recommended: true,
    covers: [
      { label: "Job Loss Cover",        covered: true, detail: "6 EMIs covered" },
      { label: "Accidental Disability", covered: true, detail: "Full outstanding" },
      { label: "Critical Illness",      covered: true, detail: "₹5L cover" },
      { label: "Death Benefit",         covered: true, detail: "Full outstanding" },
    ],
  },
  {
    id: "elite",
    name: "Elite Shield",
    icon: "💎",
    premium: 999,
    premiumNote: "/month",
    color: "border-amber-400",
    headerBg: "bg-amber-500",
    covers: [
      { label: "Job Loss Cover",        covered: true, detail: "12 EMIs covered" },
      { label: "Accidental Disability", covered: true, detail: "Full outstanding" },
      { label: "Critical Illness",      covered: true, detail: "₹10L cover" },
      { label: "Death Benefit",         covered: true, detail: "Full outstanding + ₹2L extra" },
    ],
  },
];

export function LoanInsurance({ emi }) {
  const [selected, setSelected] = useState("premium");
  const [added,    setAdded]    = useState(false);
  const plan = PLANS.find(p => p.id === selected);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🛡️</span>
          <div>
            <p className="font-bold text-lg">Credit Protect</p>
            <p className="text-indigo-200 text-xs">Protect your loan, protect your family</p>
          </div>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed">
          If you lose your job, face a medical emergency, or something happens to you — Credit Protect ensures your EMIs are covered and your family isn't burdened.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-3 gap-3">
        {PLANS.map(p => (
          <div key={p.id} onClick={() => setSelected(p.id)}
            className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${p.color} ${selected===p.id?"shadow-lg scale-[1.02]":"opacity-80 hover:opacity-100"}`}>
            <div className={`${p.headerBg} p-3 text-center ${p.recommended?"text-white":"text-slate-700"}`}>
              {p.recommended && <p className="text-xs font-bold text-white/80 mb-0.5">Recommended</p>}
              <div className="text-2xl">{p.icon}</div>
              <p className="text-xs font-bold mt-0.5">{p.name}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-lg font-black text-slate-800">₹{p.premium}</p>
              <p className="text-xs text-slate-400">{p.premiumNote}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected plan details */}
      {plan && (
        <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200">
            <p className="text-xs font-bold text-slate-600">{plan.icon} {plan.name} — Coverage Details</p>
          </div>
          {plan.covers.map(c => (
            <div key={c.label} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${c.covered ? "text-green-500" : "text-slate-300"}`}>{c.covered ? "✓" : "✗"}</span>
                <span className={`text-xs font-medium ${c.covered ? "text-slate-700" : "text-slate-400"}`}>{c.label}</span>
              </div>
              <span className={`text-xs ${c.covered ? "text-slate-600 font-semibold" : "text-slate-300"}`}>{c.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* EMI impact */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-blue-500 font-semibold">Your EMI with {plan?.name}</p>
          <p className="text-lg font-bold text-blue-700">₹{fmt((emi || 9415) + (plan?.premium || 0))}/mo</p>
          <p className="text-xs text-blue-400">EMI ₹{fmt(emi || 9415)} + Shield ₹{plan?.premium}/mo</p>
        </div>
        <button onClick={() => setAdded(true)}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${added ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
          {added ? "✅ Added!" : "Add to Loan"}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Underwritten by HDFC Ergo General Insurance. Claims processed within 7 working days.
      </p>
    </div>
  );
}

// ── FEATURE 7: Refer & Earn ───────────────────────────────────────────────────
export function ReferAndEarn({ userName }) {
  const [copied,  setCopied]  = useState(false);
  const [shareTab,setShareTab]= useState("link");
  const referralCode = `FINLEND${(userName || "USER").slice(0,4).toUpperCase()}2026`;
  const referralLink = `https://finlend.ai/join?ref=${referralCode}`;

  const mockReferrals = [
    { name: "Rahul S.",    status: "Loan Approved",  reward: 500,  date: "2 Jun" },
    { name: "Priya M.",    status: "Applied",         reward: null, date: "5 Jun" },
    { name: "Amit K.",     status: "Loan Disbursed",  reward: 500,  date: "8 Jun" },
  ];
  const totalEarned = mockReferrals.filter(r => r.reward).reduce((s, r) => s + r.reward, 0);

  const copy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">Refer & Earn</p>
        <p className="text-3xl font-black mb-1">₹500 <span className="text-xl font-bold">per referral</span></p>
        <p className="text-amber-100 text-sm leading-relaxed">Invite friends. When they take a loan with FinLend AI, you both get ₹500 credited to your account.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["You get", "₹500"], ["Friend gets", "₹500 + 0.5% off"], ["On disbursement", "Instant credit"]].map(([l,v]) => (
            <div key={l} className="bg-white/15 rounded-xl p-2">
              <p className="text-amber-100 text-xs">{l}</p>
              <p className="text-white font-bold text-xs mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[["Total Earned", `₹${totalEarned}`, "text-green-600"], ["Referrals", mockReferrals.length, "text-blue-600"], ["Pending", mockReferrals.filter(r=>!r.reward).length, "text-orange-500"]].map(([l,v,c]) => (
          <div key={l} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-xs text-slate-400 mb-0.5">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {/* Share options */}
      <div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-3">
          {["link", "whatsapp", "code"].map(t => (
            <button key={t} onClick={() => setShareTab(t)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${shareTab===t?"bg-white text-blue-600 shadow-sm":"text-slate-500"}`}>
              {t === "link" ? "📎 Link" : t === "whatsapp" ? "💬 WhatsApp" : "🔑 Code"}
            </button>
          ))}
        </div>

        {shareTab === "link" && (
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-500 truncate font-mono">{referralLink}</div>
            <button onClick={copy} className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${copied ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        )}

        {shareTab === "whatsapp" && (
          <a href={`https://wa.me/?text=Hey! Apply for a personal loan at FinLend AI — AI-powered, instant approval. Use my referral link: ${referralLink}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all">
            💬 Share via WhatsApp
          </a>
        )}

        {shareTab === "code" && (
          <div className="text-center">
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl py-4 px-6 inline-block">
              <p className="text-xs text-slate-400 mb-1">Your referral code</p>
              <p className="text-2xl font-black text-blue-700 tracking-widest">{referralCode}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">Friends enter this code when applying</p>
          </div>
        )}
      </div>

      {/* Referral history */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-2">Your Referrals</p>
        <div className="space-y-2">
          {mockReferrals.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">{r.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.date} · {r.status}</p>
                </div>
              </div>
              {r.reward
                ? <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">+₹{r.reward}</span>
                : <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Pending</span>}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs font-bold text-slate-600 mb-3">How it works</p>
        {[["1","Share your link or code with a friend"],["2","They apply and get approved on FinLend AI"],["3","You both get ₹500 credited instantly on disbursement"]].map(([n,t]) => (
          <div key={n} className="flex gap-3 mb-2 last:mb-0">
            <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{n}</div>
            <p className="text-xs text-slate-500">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}