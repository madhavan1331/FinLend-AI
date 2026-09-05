import { useState } from "react";
import { fmt, calcEMI, calcFinScore } from "../utils/helpers";
import { FinancialHealthScore } from "./FinancialHealthScore";
import { DynamicRateTracker } from "./Features1";
import { EMIHoliday } from "./Features1";
import { GamificationHub } from "./Features2";
import { ApplicationTracker } from "./Features2";
import { WhatsAppNotifications } from "./Features2";
import { PrepaymentScreen } from "./Features2";
import { CreditScoreHistory, LoanInsurance, ReferAndEarn } from "./NewFeatures";
import { CompetitorComparison } from "./SmartFeatures";

function buildSchedule(principal, tenure, rate = 12) {
  const r = rate / 12 / 100;
  const emi = calcEMI(principal, tenure, rate);
  let balance = principal;
  return Array.from({ length: tenure }, (_, i) => {
    const interest = Math.round(balance * r);
    const prinPart = Math.max(0, emi - interest);
    balance = Math.max(0, balance - prinPart);
    return { month: i + 1, emi, interest, principal: prinPart, balance, paid: i < 2 };
  });
}

const TABS = [
  { id: "overview",   icon: "🏠", label: "Overview"   },
  { id: "finscore",   icon: "❤️",  label: "FinScore"   },
  { id: "rate",       icon: "📉", label: "My Rate"    },
  { id: "schedule",   icon: "📅", label: "Schedule"   },
  { id: "prepay",     icon: "💪", label: "Prepay"     },
  { id: "holiday",    icon: "🏖️", label: "Holiday"    },
  { id: "rewards",    icon: "🏆", label: "Rewards"    },
  { id: "tracker",    icon: "🔍", label: "Tracker"    },
  { id: "whatsapp",   icon: "💬", label: "WhatsApp"   },
  { id: "credit",     icon: "📈", label: "Credit"     },
  { id: "insurance",  icon: "🛡️", label: "Insurance"  },
  { id: "refer",      icon: "🤝", label: "Refer"      },
  { id: "compare",    icon: "⚖️", label: "Compare"    },
  { id: "documents",  icon: "📄", label: "Documents"  },
];

export function DisbursementDashboard({ loanAmount, tenure, rate = 12, mobile, userName, cibilScore }) {
  const [tab,         setTab]         = useState("overview");
  const [holidayUsed, setHolidayUsed] = useState(false);
  const [currentRate, setCurrentRate] = useState(rate);
  const [showTopUp,   setShowTopUp]   = useState(false);

  const onTimePayments = 2;
  const streak         = 2;
  const emi            = calcEMI(Number(loanAmount), Number(tenure), currentRate);
  const schedule       = buildSchedule(Number(loanAmount), Number(tenure), currentRate);
  const paidEMIs       = schedule.filter(r => r.paid).length;
  const outstanding    = Math.max(0, loanAmount - schedule.filter(r => r.paid).reduce((s, r) => s + r.principal, 0));
  const finScore       = calcFinScore({ cibilScore: cibilScore || 690, income: 50000, emi, onTimePayments, totalPayments: tenure });

  return (
    <div>
      {/* Approval hero */}
      <div className="text-center mb-5">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-3xl font-bold text-green-700 mb-1">Loan Approved & Disbursed!</h2>
        <p className="text-slate-500 text-sm">₹{fmt(loanAmount)} will be credited within 24 hours.</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          ["Loan Amount", `₹${fmt(loanAmount)}`, "text-blue-600"],
          ["Monthly EMI",  `₹${fmt(emi)}`,        "text-blue-600"],
          ["EMIs Paid",    `${paidEMIs}/${tenure}`,"text-green-600"],
          ["Outstanding",  `₹${fmt(outstanding)}`, "text-orange-500"],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-0.5">{l}</p>
            <p className={`text-base font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {/* Next EMI */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center mb-5">
        <div>
          <p className="text-xs text-blue-500 font-bold uppercase">Next EMI Due</p>
          <p className="text-lg font-bold text-blue-700">₹{fmt(emi)} on 5th July 2026</p>
          <p className="text-xs text-blue-400">Auto-debit via UPI · {currentRate}% p.a.</p>
        </div>
        <div className="text-3xl">📅</div>
      </div>

      {/* Tab bar — horizontally scrollable */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0
              ${tab === t.id ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(paidEMIs/tenure)*100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{paidEMIs} EMIs paid</span><span>{tenure-paidEMIs} remaining</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2">
            <p className="text-sm font-bold text-slate-700 mb-2">Loan Details</p>
            {[
              ["Loan ID","FL2026060112"],["Disbursement","06 June 2026"],
              ["Rate",`${currentRate}% p.a.`],["Maturity",`June ${2026+Math.floor(tenure/12)}`],
              ["Processing Fee",`₹${fmt(loanAmount*0.02)}`]
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-400">{k}</span>
                <span className="font-semibold text-slate-700">{v}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowTopUp(true)}
              className="py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
              Request Top-Up Loan
            </button>
            <button onClick={() => setTab("refer")}
              className="py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all">
              Refer & Earn ₹500 🤝
            </button>
          </div>
          {/* Top-Up Modal */}
          {showTopUp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">🏦 Loan Top-Up Request</h3>
                  <button onClick={() => setShowTopUp(false)} className="text-slate-400 text-2xl">×</button>
                </div>
                <TopUpFlow loanAmount={loanAmount} outstanding={outstanding} onClose={() => setShowTopUp(false)} />
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "finscore"   && <FinancialHealthScore score={finScore} cibilScore={cibilScore||690} income={50000} emi={emi} streak={streak} />}
      {tab === "rate"       && <DynamicRateTracker currentRate={currentRate} onTimePayments={onTimePayments} totalPayments={tenure} />}
      {tab === "schedule"   && <RepaymentSchedule schedule={schedule} tenure={tenure} />}
      {tab === "prepay"     && <PrepaymentScreen loanAmount={loanAmount} tenure={tenure} rate={currentRate} onTimePayments={onTimePayments} />}
      {tab === "holiday"    && <EMIHoliday emi={emi} tenure={tenure} onTimePayments={onTimePayments} holidayUsed={holidayUsed} onRequestHoliday={() => setHolidayUsed(true)} />}
      {tab === "rewards"    && <GamificationHub onTimePayments={onTimePayments} finScore={finScore} streak={streak} />}
      {tab === "tracker"    && <ApplicationTracker currentStage={2} />}
      {tab === "whatsapp"   && <WhatsAppNotifications mobile={mobile} />}
      {tab === "credit"     && <CreditScoreHistory currentScore={cibilScore || 690} />}
      {tab === "insurance"  && <LoanInsurance emi={emi} />}
      {tab === "refer"      && <ReferAndEarn userName={userName} />}
      {tab === "compare"    && <CompetitorComparison userRate={currentRate} />}
      {tab === "documents"  && <DocumentsTab />}
    </div>
  );
}

// ── Top-Up Flow ───────────────────────────────────────────────────────────────
function TopUpFlow({ loanAmount, outstanding, onClose }) {
  const [topUpAmount, setTopUpAmount] = useState(100000);
  const [submitted,   setSubmitted]   = useState(false);
  const maxTopUp = Math.min(500000, loanAmount * 0.5);
  const topUpEMI = Math.round(calcEMI(topUpAmount, 24, 12));

  if (submitted) return (
    <div className="text-center py-4">
      <div className="text-5xl mb-3">✅</div>
      <h3 className="text-xl font-bold text-green-700 mb-2">Top-Up Request Submitted!</h3>
      <p className="text-slate-500 text-sm mb-1">₹{fmt(topUpAmount)} top-up request sent for review.</p>
      <p className="text-xs text-slate-400 mb-4">Decision within 4 working hours. No new KYC needed.</p>
      <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Done</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
        ✅ As an existing FinLend customer, your KYC is already done. No new documents needed for top-up.
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-center">
        {[["Current Loan", `₹${fmt(loanAmount)}`], ["Outstanding", `₹${fmt(outstanding)}`], ["Max Top-Up", `₹${fmt(maxTopUp)}`], ["Your CIBIL", "690 ✓"]].map(([l,v]) => (
          <div key={l} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-slate-400 mb-0.5">{l}</p>
            <p className="font-bold text-slate-700">{v}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-slate-600">Top-Up Amount</span>
          <span className="font-bold text-blue-600">₹{fmt(topUpAmount)}</span>
        </div>
        <input type="range" min={50000} max={maxTopUp} step={10000} value={topUpAmount}
          onChange={e => setTopUpAmount(Number(e.target.value))} className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>₹50,000</span><span>₹{fmt(maxTopUp)}</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-sm">
        {[["Top-Up Amount", `₹${fmt(topUpAmount)}`], ["New EMI (24 mo)", `₹${fmt(topUpEMI)}/mo`], ["Interest Rate", "12% p.a."], ["Processing Fee", `₹${fmt(topUpAmount * 0.02)}`]].map(([k,v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-slate-500">{k}</span>
            <span className="font-bold text-slate-700">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button>
        <button onClick={() => setSubmitted(true)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Apply for Top-Up →</button>
      </div>
    </div>
  );
}

// ── Repayment Schedule ────────────────────────────────────────────────────────
function RepaymentSchedule({ schedule, tenure }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[400px]">
        <thead>
          <tr className="text-slate-400 border-b border-slate-100">
            {["Month","EMI","Principal","Interest","Balance","Status"].map(h => (
              <td key={h} className="pb-2 pr-2 font-semibold">{h}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.slice(0, 12).map(row => (
            <tr key={row.month} className={`border-b border-slate-50 ${row.paid ? "opacity-50" : ""}`}>
              <td className="py-2 pr-2">{row.month}</td>
              <td className="py-2 pr-2 font-semibold">₹{fmt(row.emi)}</td>
              <td className="py-2 pr-2 text-blue-600">₹{fmt(row.principal)}</td>
              <td className="py-2 pr-2 text-orange-500">₹{fmt(row.interest)}</td>
              <td className="py-2 pr-2 text-slate-400">₹{fmt(row.balance)}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.paid ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {row.paid ? "Paid" : "Due"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tenure > 12 && <p className="text-xs text-slate-400 mt-2 text-center">Showing 12 of {tenure} EMIs</p>}
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab() {
  return (
    <div className="space-y-3">
      {[
        ["📄 Loan Agreement",    "Signed — 06 June 2026"],
        ["📊 Sanction Letter",   "Issued — 06 June 2026"],
        ["🏦 Disbursement Advice","Pending — 07 June 2026"],
        ["📋 Repayment Schedule","Available"],
        ["🏆 NOC Letter",        "Available after full repayment"],
      ].map(([name,status]) => (
        <div key={name} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-700">{name}</p>
            <p className="text-xs text-slate-400">{status}</p>
          </div>
          <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700">Download</button>
        </div>
      ))}
    </div>
  );
}