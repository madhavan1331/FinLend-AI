import { useState } from "react";
import { fmt, calcEMI } from "../utils/helpers";

// ── FEATURE 6: Gamification ───────────────────────────────────────────────────
const ALL_BADGES = [
  { id: "first_emi",    icon: "🎯", name: "First EMI",       desc: "Paid your first EMI",              earned: true  },
  { id: "streak3",      icon: "🔥", name: "3-Month Streak",  desc: "3 consecutive on-time payments",   earned: true  },
  { id: "streak6",      icon: "⚡", name: "6-Month Streak",  desc: "6 consecutive on-time payments",   earned: false },
  { id: "early_bird",   icon: "🌅", name: "Early Bird",      desc: "Paid EMI 3 days before due date",  earned: true  },
  { id: "gold_borrower",icon: "🏆", name: "Gold Borrower",   desc: "Reached Gold tier (FinScore ≥ 75)",earned: false },
  { id: "prepayer",     icon: "💪", name: "Prepayer",        desc: "Made your first prepayment",       earned: false },
  { id: "referrer",     icon: "🤝", name: "Connector",       desc: "Referred a friend successfully",   earned: false },
  { id: "full_repay",   icon: "🎉", name: "Debt Free",       desc: "Fully repaid your loan",           earned: false },
];

export function GamificationHub({ onTimePayments, finScore, streak }) {
  const [tab, setTab] = useState("badges");
  const earnedCoins = onTimePayments * 50 + (streak >= 6 ? 200 : 0);

  return (
    <div className="space-y-4">
      {/* FinCoins balance */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-5 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-amber-100 text-xs font-semibold uppercase tracking-wide">FinCoins Balance</p>
            <p className="text-4xl font-black mt-1">🪙 {earnedCoins}</p>
            <p className="text-amber-100 text-xs mt-1">Earn 50 coins per on-time EMI</p>
          </div>
          <div className="text-right">
            <p className="text-amber-100 text-xs">Redeem for</p>
            <p className="text-white text-sm font-bold">Rate discount</p>
            <p className="text-white text-sm font-bold">Fee waiver</p>
          </div>
        </div>
        <div className="mt-4 bg-amber-300/40 rounded-xl p-3 text-xs">
          💡 500 coins = 0.1% rate reduction on your next EMI
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {["badges","streak","rewards"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all
              ${tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "badges" && (
        <div className="grid grid-cols-2 gap-3">
          {ALL_BADGES.map(b => (
            <div key={b.id} className={`rounded-xl p-4 border-2 text-center transition-all
              ${b.earned ? "border-amber-300 bg-amber-50" : "border-slate-100 bg-slate-50 opacity-50"}`}>
              <div className="text-3xl mb-1">{b.icon}</div>
              <p className={`text-xs font-bold ${b.earned ? "text-amber-800" : "text-slate-400"}`}>{b.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
              {b.earned && <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full mt-1 inline-block">Earned ✓</span>}
            </div>
          ))}
        </div>
      )}

      {tab === "streak" && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700">Current Streak</p>
              <div className="flex items-center gap-1">
                <span className="text-xl">🔥</span>
                <span className="text-2xl font-black text-orange-500">{streak}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-center mb-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                  ${i < onTimePayments ? "bg-green-500 text-white" : i === onTimePayments ? "bg-blue-200 text-blue-700 border-2 border-blue-500" : "bg-slate-100 text-slate-300"}`}>
                  {i < onTimePayments ? "✓" : i + 1}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">{12 - onTimePayments} EMIs left for 1-year milestone</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs text-orange-700">
            🔥 Keep your streak going! Miss a payment and the streak resets to zero.
          </div>
        </div>
      )}

      {tab === "rewards" && (
        <div className="space-y-3">
          {[
            { coins: 200, reward: "Free credit report",            available: earnedCoins >= 200 },
            { coins: 500, reward: "0.1% rate reduction (1 EMI)",   available: earnedCoins >= 500 },
            { coins: 1000, reward: "Processing fee waiver (next loan)", available: earnedCoins >= 1000 },
            { coins: 2000, reward: "0.5% permanent rate reduction", available: earnedCoins >= 2000 },
          ].map(r => (
            <div key={r.coins} className={`flex items-center justify-between p-4 rounded-xl border ${r.available ? "border-green-200 bg-green-50" : "border-slate-100 bg-white"}`}>
              <div>
                <p className="text-sm font-bold text-slate-700">{r.reward}</p>
                <p className="text-xs text-amber-600 font-semibold">🪙 {r.coins} FinCoins</p>
              </div>
              <button disabled={!r.available}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${r.available ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}>
                {r.available ? "Redeem" : `Need ${r.coins - earnedCoins} more`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FEATURE 7: Application Status Tracker ────────────────────────────────────
export function ApplicationTracker({ currentStage = 2 }) {
  const stages = [
    { id: 0, icon: "📝", label: "Application Submitted",    time: "Today, 2:08 PM",   desc: "Your application has been received." },
    { id: 1, icon: "🔍", label: "Document Verification",    time: "Today, 2:15 PM",   desc: "Our team is verifying your documents." },
    { id: 2, icon: "🧠", label: "Credit Underwriting",      time: "Today, 2:45 PM",   desc: "AI engine is assessing your creditworthiness." },
    { id: 3, icon: "✅", label: "Loan Approved",            time: "Pending",          desc: "Final approval by our credit committee." },
    { id: 4, icon: "💸", label: "Disbursement Initiated",   time: "Pending",          desc: "Amount transferred to your bank account." },
    { id: 5, icon: "🎉", label: "Amount Credited",          time: "Pending",          desc: "Loan amount credited to your account." },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-blue-500 font-semibold uppercase">Application ID</p>
          <p className="text-base font-bold text-blue-800">FL2026060112</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-500">Estimated credit</p>
          <p className="text-sm font-bold text-blue-800">Within 4 hours</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200" />
        <div className="space-y-1">
          {stages.map((s) => {
            const done    = s.id < currentStage;
            const active  = s.id === currentStage;
            const pending = s.id > currentStage;
            return (
              <div key={s.id} className={`flex gap-4 p-4 rounded-xl transition-all relative
                ${active ? "bg-blue-50 border border-blue-200" : ""}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 z-10 border-2
                  ${done ? "bg-green-100 border-green-300" : active ? "bg-blue-100 border-blue-400 shadow-md" : "bg-white border-slate-200"}`}>
                  {active ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-bold ${done ? "text-green-700" : active ? "text-blue-700" : "text-slate-300"}`}>{s.label}</p>
                    <p className="text-xs text-slate-400 ml-2 shrink-0">{s.time}</p>
                  </div>
                  <p className={`text-xs mt-0.5 ${done || active ? "text-slate-500" : "text-slate-300"}`}>{s.desc}</p>
                  {active && <p className="text-xs text-blue-600 font-semibold mt-1 animate-pulse">● In progress...</p>}
                  {done && <p className="text-xs text-green-600 font-semibold mt-1">✓ Completed</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── FEATURE 8: WhatsApp Notifications ────────────────────────────────────────
export function WhatsAppNotifications({ mobile }) {
  const [prefs, setPrefs] = useState({
    emi_reminder: true, approval: true, disbursement: true,
    statement: false,   offers: false,  rate_update: true,
  });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const options = [
    { key: "emi_reminder", label: "EMI Reminders",      desc: "3 days before due date",        icon: "📅" },
    { key: "approval",     label: "Loan Status Updates", desc: "Approval and rejection alerts", icon: "✅" },
    { key: "disbursement", label: "Disbursement Alert",  desc: "When money is credited",        icon: "💸" },
    { key: "rate_update",  label: "Rate Improvements",   desc: "When your rate decreases",      icon: "📉" },
    { key: "statement",    label: "Monthly Statement",   desc: "EMI receipt every month",       icon: "📄" },
    { key: "offers",       label: "Exclusive Offers",    desc: "Top-up and special offers",     icon: "🎁" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#25D366] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">💬</div>
          <div>
            <p className="font-bold">WhatsApp Notifications</p>
            <p className="text-green-100 text-xs">Connected to +91 {mobile || "XXXXX XXXXX"}</p>
          </div>
        </div>
        <p className="text-green-100 text-xs">All loan updates, EMI reminders and alerts sent directly to your WhatsApp — no need to open the app.</p>
      </div>

      {/* Sample message preview */}
      <div className="bg-[#ECE5DD] rounded-xl p-4">
        <p className="text-xs font-bold text-slate-500 mb-2">Sample message preview</p>
        <div className="bg-white rounded-xl p-3 max-w-xs shadow-sm">
          <p className="text-xs text-slate-800 leading-relaxed">
            🏦 <strong>FinLend AI</strong><br/>
            Hi! Your EMI of ₹9,415 is due in 3 days (9th June).<br/><br/>
            Auto-debit is active ✅<br/>
            Reply SKIP to request EMI Holiday.
          </p>
          <p className="text-xs text-slate-400 text-right mt-1">2:08 PM ✓✓</p>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-2">
        {options.map(o => (
          <div key={o.key} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">{o.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">{o.label}</p>
                <p className="text-xs text-slate-400">{o.desc}</p>
              </div>
            </div>
            <button onClick={() => setPrefs(p => ({...p, [o.key]: !p[o.key]}))}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${prefs[o.key] ? "bg-green-500" : "bg-slate-200"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${prefs[o.key] ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={save}
        className={`w-full py-3.5 rounded-xl font-bold transition-all ${saved ? "bg-green-600 text-white" : "bg-[#25D366] text-white hover:bg-green-600"}`}>
        {saved ? "✅ Preferences Saved!" : "Save WhatsApp Preferences"}
      </button>
    </div>
  );
}

// ── FEATURE 9: Prepayment & Foreclosure ──────────────────────────────────────
export function PrepaymentScreen({ loanAmount, tenure, rate, onTimePayments }) {
  const [tab,       setTab]       = useState("part");
  const [extraEMI,  setExtraEMI]  = useState(0);
  const [showFC,    setShowFC]    = useState(false);

  const emi            = calcEMI(Number(loanAmount), Number(tenure), rate);
  const paidPrincipal  = Math.round(onTimePayments * emi * 0.7); // approx
  const outstanding    = Math.max(0, loanAmount - paidPrincipal);
  const foreclosureFee = onTimePayments >= 6 ? Math.round(outstanding * 0.02) : null;
  const totalFC        = outstanding + (foreclosureFee || 0);

  const remaining     = tenure - onTimePayments;
  const newTenure     = extraEMI > 0 ? Math.max(1, Math.round(remaining * (emi / (emi + Number(extraEMI))) * 0.85)) : remaining;
  const interestSaved = Math.max(0, (emi * remaining) - ((emi + Number(extraEMI)) * newTenure));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        {[["Outstanding",`₹${fmt(outstanding)}`,"text-orange-600"],["Paid EMIs",`${onTimePayments}/${tenure}`,"text-green-600"],["Remaining",`${remaining} mo`,"text-blue-600"]].map(([l,v,c]) => (
          <div key={l} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-slate-400 mb-1">{l}</p>
            <p className={`text-base font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {["part","full"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize
              ${tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
            {t === "part" ? "Part Prepayment" : "Full Foreclosure"}
          </button>
        ))}
      </div>

      {tab === "part" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm font-bold text-slate-700 mb-3">💰 Calculate Part Prepayment</p>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Extra monthly payment</span>
              <span className="font-bold text-blue-600">₹{fmt(extraEMI)}</span>
            </div>
            <input type="range" min="0" max={emi} step="500" value={extraEMI}
              onChange={(e) => setExtraEMI(Number(e.target.value))} className="w-full accent-blue-600 mb-4" />
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["New Tenure",`${newTenure} mo`,"text-green-600"],["New EMI",`₹${fmt(emi+Number(extraEMI))}`,"text-blue-600"],["Interest Saved",`₹${fmt(interestSaved)}`,"text-orange-500"]].map(([l,v,c]) => (
                <div key={l} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-xs text-slate-400">{l}</p>
                  <p className={`text-sm font-bold ${c}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          {extraEMI > 0 && (
            <button className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
              Confirm Part Prepayment of ₹{fmt(emi + Number(extraEMI))} Next Month
            </button>
          )}
        </div>
      )}

      {tab === "full" && (
        <div className="space-y-3">
          {onTimePayments < 6 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
              <p className="text-lg mb-2">⏳</p>
              <p className="text-sm font-bold text-yellow-800">Foreclosure available after 6 EMIs</p>
              <p className="text-xs text-yellow-600 mt-1">Pay {6 - onTimePayments} more EMIs to unlock foreclosure.</p>
            </div>
          ) : (
            <>
              <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-2">
                <p className="text-sm font-bold text-slate-700 mb-3">Foreclosure Breakdown</p>
                {[["Outstanding Principal",`₹${fmt(outstanding)}`],["Foreclosure Charge (2%)",`₹${fmt(foreclosureFee)}`],["Total Payable",`₹${fmt(totalFC)}`]].map(([k,v],i) => (
                  <div key={k} className={`flex justify-between text-sm py-2 ${i === 2 ? "border-t border-slate-200 font-bold" : ""}`}>
                    <span className="text-slate-500">{k}</span>
                    <span className={i === 2 ? "text-blue-700" : "text-slate-700"}>{v}</span>
                  </div>
                ))}
              </div>
              {!showFC ? (
                <button onClick={() => setShowFC(true)} className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">
                  Request Full Foreclosure
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <p className="text-sm font-bold text-red-800 mb-2">⚠️ Confirm Foreclosure?</p>
                  <p className="text-xs text-red-600 mb-4">Pay ₹{fmt(totalFC)} to close your loan completely. An NOC will be issued within 7 working days.</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">Yes, Foreclose</button>
                    <button onClick={() => setShowFC(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
            After full repayment, you'll receive a No Objection Certificate (NOC) and CIBIL update within 30 days.
          </div>
        </div>
      )}
    </div>
  );
}