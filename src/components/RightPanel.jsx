import { useState } from "react";
import { fmt, calcEMI } from "../utils/helpers";

const TIPS = {
  0:  ["OTP expires in 10 minutes","Don't share OTP with anyone","Use Aadhaar-linked mobile"],
  1:  ["Higher loan = higher EMI","Shorter tenure = less interest","Min EMI must be ₹3,000"],
  2:  ["PAN is mandatory for KYC","Use mobile linked to Aadhaar","Email needed for documents"],
  3:  ["Score ≥ 750 gets best rates","Score ≥ 650 is minimum","Soft check — no score impact"],
  4:  ["Salaried applicants preferred","Min. 1 yr work experience","ITR needed for self-employed"],
  5:  ["Min income ₹15,000/month","Include all income sources","EMI ≤ 40% of income advised"],
  6:  ["PIN code verifies location","Utility bill accepted as proof","Current & permanent may differ"],
  7:  ["Account must be in your name","IFSC: BANK0XXXXXX format","3-month statement preferred"],
  8:  ["Aadhaar + PAN are mandatory","Max file size 5 MB each","DigiLocker fetch is instant"],
  9:  ["Hold phone steady","Good lighting needed","Takes under 30 seconds"],
  10: ["E-Sign is legally binding","OTP sent to Aadhaar mobile","No physical signature needed"],
  11: ["Mandate enables auto-debit","UPI autopay recommended","First EMI 30 days after disburse"],
  12: ["Review all details carefully","Use Edit to fix any section","Cannot undo after submission"],
  13: ["Money credited within 24 hrs","Download NOC after full repay","Prepay available after 6 EMIs"],
};

const NOTIFS = [
  { id: 1, msg: "Your application is 60% complete", time: "2 min ago", type: "info",    read: false },
  { id: 2, msg: "CIBIL check completed successfully",time: "5 min ago", type: "success", read: false },
  { id: 3, msg: "Document upload required",          time: "1 hr ago",  type: "warning", read: true  },
];

export function RightPanel({ step, formData, darkMode, cibilScore, activeRate }) {
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);
  const unread = notifs.filter(n => !n.read).length;
  const emi = calcEMI(Number(formData.loanAmount), Number(formData.tenure), activeRate || 12);

  const c = darkMode
    ? { card:"bg-gray-800 border-gray-700", text:"text-gray-100", sub:"text-gray-400" }
    : { card:"bg-white border-slate-100",   text:"text-slate-700", sub:"text-slate-400" };

  return (
    <div className="space-y-4">
      {/* Notifications */}
      <div className={`${c.card} rounded-2xl shadow-md border p-4`}>
        <button onClick={() => setShowNotif(!showNotif)} className="flex items-center justify-between w-full">
          <span className={`text-sm font-bold ${c.text}`}>🔔 Notifications</span>
          {unread > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unread}</span>}
        </button>
        {showNotif && (
          <div className="mt-3 space-y-2">
            {notifs.map(n => (
              <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id===n.id ? {...x,read:true} : x))}
                className={`p-2.5 rounded-lg cursor-pointer text-xs transition-all ${n.read ? "opacity-50" : n.type==="success" ? "bg-green-50 border border-green-200" : n.type==="warning" ? "bg-yellow-50 border border-yellow-200" : "bg-blue-50 border border-blue-200"}`}>
                <p className="font-semibold text-slate-700">{n.msg}</p>
                <p className="text-slate-400 mt-0.5">{n.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loan summary */}
      {step > 1 && step < 13 && (
        <div className={`${c.card} rounded-2xl shadow-md border p-4`}>
          <p className={`text-sm font-bold ${c.text} mb-3`}>📋 Loan Summary</p>
          {[
            ["Amount",       `₹${fmt(formData.loanAmount)}`],
            ["Tenure",       `${formData.tenure} mo`],
            ["EMI",          `₹${fmt(emi)}`],
            ["Rate",         `${activeRate || 12}% p.a.`],
            ["Total Payable",`₹${fmt(emi * formData.tenure)}`],
            ...(cibilScore ? [["CIBIL Score", String(cibilScore)]] : []),
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
              <span className={c.sub}>{k}</span>
              <span className={`font-bold ${c.text}`}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step tips */}
      <div className={`${c.card} rounded-2xl shadow-md border p-4`}>
        <p className={`text-sm font-bold ${c.text} mb-2`}>💡 Tips</p>
        {(TIPS[step] || TIPS[1]).map((t, i) => (
          <p key={i} className={`text-xs ${c.sub} mb-1.5 flex gap-2`}><span className="text-blue-400 shrink-0">→</span>{t}</p>
        ))}
      </div>

      {/* Pricing */}
      <div className={`${c.card} rounded-2xl shadow-md border p-4`}>
        <p className={`text-sm font-bold ${c.text} mb-2`}>💲 Pricing</p>
        {[["Interest Rate",`${activeRate||12}% p.a.`],["Processing Fee","2%"],["Late Fee","₹500"],["Foreclosure","2% (after 6 EMIs)"]].map(([k,v]) => (
          <div key={k} className="flex justify-between text-xs py-1">
            <span className={c.sub}>{k}</span><span className={`font-semibold ${c.text}`}>{v}</span>
          </div>
        ))}
      </div>

      {/* Live stats */}
      <div className={`${c.card} rounded-2xl shadow-md border p-4`}>
        <p className={`text-sm font-bold ${c.text} mb-2`}>📈 Live</p>
        {[["Total Apps","12,540",""],["Under Review","342","text-yellow-600"],["Approved Today","126","text-green-600"],["Disbursed Today","₹2.1Cr","text-blue-600"]].map(([k,v,col]) => (
          <div key={k} className="flex justify-between text-xs py-1">
            <span className={c.sub}>{k}</span><span className={`font-semibold ${col||c.text}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}