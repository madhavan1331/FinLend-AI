import { useState } from "react";
import { fmt, calcEMI } from "../utils/helpers";

// ── FEATURE 3: Smart Loan Recommender ────────────────────────────────────────
// Detects purpose and suggests optimal loan amount + tenure
const PURPOSE_RECOMMENDATIONS = {
  personal:  { min: 50000,   max: 300000,  ideal: 150000, tenure: 24, reason: "Personal needs are best covered with a mid-range loan repaid in 2 years." },
  medical:   { min: 100000,  max: 500000,  ideal: 200000, tenure: 18, reason: "Medical emergencies typically need ₹1–5L. Shorter tenure reduces interest burden." },
  education: { min: 200000,  max: 1000000, ideal: 500000, tenure: 48, reason: "Education loans need higher amounts. 4-year tenure keeps EMI manageable." },
  travel:    { min: 50000,   max: 200000,  ideal: 100000, tenure: 12, reason: "Travel loans are best kept small and cleared quickly in 12 months." },
  home:      { min: 300000,  max: 1000000, ideal: 500000, tenure: 48, reason: "Home renovation needs significant funds. Spread over 4 years for comfort." },
  wedding:   { min: 200000,  max: 800000,  ideal: 400000, tenure: 36, reason: "Wedding expenses are best financed over 3 years." },
  business:  { min: 300000,  max: 1000000, ideal: 600000, tenure: 36, reason: "Business loans work best over 3 years to maintain healthy cash flow." },
};

export function SmartLoanRecommender({ purpose, currentAmount, currentTenure, rate, onApply }) {
  const rec = PURPOSE_RECOMMENDATIONS[purpose] || PURPOSE_RECOMMENDATIONS.personal;
  const idealEMI    = calcEMI(rec.ideal, rec.tenure, rate);
  const currentEMI  = calcEMI(currentAmount, currentTenure, rate);
  const idealTotal  = idealEMI * rec.tenure;
  const currentTotal= currentEMI * currentTenure;
  const saving      = Math.max(0, currentTotal - idealTotal);
  const isAlreadyOptimal = Math.abs(currentAmount - rec.ideal) < 50000 && Math.abs(currentTenure - rec.tenure) < 6;

  if (isAlreadyOptimal) return (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
      <span className="text-xl shrink-0">✅</span>
      <div>
        <p className="text-sm font-bold text-green-700">Your selection looks optimal for {purpose}!</p>
        <p className="text-xs text-green-600 mt-0.5">{rec.reason}</p>
      </div>
    </div>
  );

  return (
    <div className="mt-4 border border-blue-200 rounded-xl overflow-hidden">
      <div className="bg-blue-600 px-4 py-2.5 flex items-center gap-2">
        <span className="text-white text-base">🤖</span>
        <p className="text-white text-xs font-bold uppercase tracking-wide">AI Recommendation for {purpose}</p>
      </div>
      <div className="p-4 bg-blue-50">
        <p className="text-xs text-blue-700 mb-3">{rec.reason}</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            ["Suggested Amount", `₹${fmt(rec.ideal)}`, currentAmount === rec.ideal ? "text-green-600" : "text-blue-700"],
            ["Suggested Tenure", `${rec.tenure} months`, currentTenure === rec.tenure ? "text-green-600" : "text-blue-700"],
            ["Suggested EMI", `₹${fmt(idealEMI)}/mo`, "text-blue-700"],
          ].map(([l, v, c]) => (
            <div key={l} className="bg-white rounded-lg p-2.5 text-center border border-blue-100">
              <p className="text-xs text-slate-400 mb-0.5">{l}</p>
              <p className={`text-sm font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        {saving > 0 && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
            💡 Switch to our recommended plan and save <strong>₹{fmt(saving)}</strong> in total interest!
          </p>
        )}
        <button onClick={() => onApply(rec.ideal, rec.tenure)}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
          Apply Recommendation → ₹{fmt(rec.ideal)} for {rec.tenure} months
        </button>
      </div>
    </div>
  );
}

// ── FEATURE 4: Competitor Comparison ─────────────────────────────────────────
const COMPETITORS = [
  {
    name: "FinLend AI",
    logo: "🏦",
    rate: null, // dynamic — passed as prop
    processing: "2%",
    time: "< 5 min",
    maxLoan: "₹10L",
    features: ["AI-powered approval", "Dynamic rate", "Video KYC", "EMI Holiday", "FinScore™"],
    highlight: true,
  },
  {
    name: "Navi",
    logo: "🟢",
    rate: "13–24%",
    processing: "0%",
    time: "< 10 min",
    maxLoan: "₹20L",
    features: ["Instant approval", "No processing fee", "App-only"],
    highlight: false,
  },
  {
    name: "MoneyView",
    logo: "🔵",
    rate: "16–39%",
    processing: "2%",
    time: "< 24 hrs",
    maxLoan: "₹5L",
    features: ["Credit score check", "Flexible tenure"],
    highlight: false,
  },
  {
    name: "KreditBee",
    logo: "🟡",
    rate: "15–29.95%",
    processing: "2–6%",
    time: "< 15 min",
    maxLoan: "₹4L",
    features: ["Small-ticket loans", "New-to-credit"],
    highlight: false,
  },
];

export function CompetitorComparison({ userRate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-1">Why FinLend AI?</p>
        <p className="text-xl font-bold mb-1">We beat competitors on what matters</p>
        <p className="text-blue-200 text-sm">Transparent pricing, AI-powered decisions, and features no other lender offers in India.</p>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <td className="px-4 py-3 font-bold text-slate-600">Feature</td>
              {COMPETITORS.map(c => (
                <td key={c.name} className={`px-4 py-3 text-center font-bold ${c.highlight ? "text-blue-700 bg-blue-50" : "text-slate-600"}`}>
                  {c.logo} {c.name}
                  {c.highlight && <span className="ml-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">You</span>}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Interest Rate",     key: "rate",       vals: [`${userRate}% p.a.`, "13–24%", "16–39%", "15–29.95%"], highlight: 0 },
              { label: "Processing Fee",    key: "processing", vals: ["2%", "0%", "2%", "2–6%"],                             highlight: -1 },
              { label: "Approval Time",     key: "time",       vals: ["< 5 min", "< 10 min", "< 24 hrs", "< 15 min"],       highlight: 0 },
              { label: "Max Loan",          key: "maxLoan",    vals: ["₹10L", "₹20L", "₹5L", "₹4L"],                       highlight: -1 },
              { label: "AI Approval",       key: "ai",         vals: ["✅", "❌", "❌", "❌"],                               highlight: 0 },
              { label: "Dynamic Rate",      key: "dynamic",    vals: ["✅", "❌", "❌", "❌"],                               highlight: 0 },
              { label: "EMI Holiday",       key: "holiday",    vals: ["✅", "❌", "❌", "❌"],                               highlight: 0 },
              { label: "Video KYC",         key: "vkyc",       vals: ["✅", "✅", "❌", "❌"],                               highlight: -1 },
              { label: "FinScore™ Coaching",key: "finscore",   vals: ["✅", "❌", "❌", "❌"],                               highlight: 0 },
            ].map((row, i) => (
              <tr key={row.label} className={`border-b border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                <td className="px-4 py-2.5 font-semibold text-slate-600">{row.label}</td>
                {row.vals.map((v, j) => (
                  <td key={j} className={`px-4 py-2.5 text-center
                    ${j === 0 ? "bg-blue-50 font-bold text-blue-700" : "text-slate-500"}
                    ${j === row.highlight ? "font-bold" : ""}`}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs text-green-700">
        🏆 <strong>FinLend AI is the only lender</strong> in India offering Dynamic Rate Reduction, EMI Holiday, FinScore™ coaching, and AI-powered loan advisor — all in one app.
      </div>
    </div>
  );
}