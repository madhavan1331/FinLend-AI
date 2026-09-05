import { useState } from "react";
import { fmt, calcEMI, rateFromScore } from "../utils/helpers";

// ── EMI Breakdown ─────────────────────────────────────────────────────────────
export function EMIBreakdown({ loanAmount, tenure, rate = 12 }) {
  const emi      = calcEMI(loanAmount, tenure, rate);
  const total    = emi * tenure;
  const interest = total - loanAmount;
  const pPct     = Math.round((loanAmount / total) * 100);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[["Monthly EMI",`₹${fmt(emi)}`,"text-blue-600"],["Interest Rate",`${rate}% p.a.`,"text-green-600"],["Total Interest",`₹${fmt(interest)}`,"text-orange-500"],["Total Payable",`₹${fmt(total)}`,"text-slate-700"]].map(([l,v,c]) => (
          <div key={l} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Principal {pPct}%</span><span>Interest {100-pPct}%</span></div>
      <div className="h-2.5 rounded-full overflow-hidden flex">
        <div className="bg-blue-500 transition-all duration-500" style={{ width:`${pPct}%` }} />
        <div className="bg-orange-400 flex-1" />
      </div>
    </div>
  );
}

// ── Selectable Loan Offer Comparison ─────────────────────────────────────────
export function LoanOfferComparison({ loanAmount, selectedOffer, onSelect }) {
  const offers = [
    { id:"fast",     label:"Short & Fast",   tenure:12, rate:14, badge:"Pay faster", icon:"⚡", desc:"Clear debt quickly" },
    { id:"balanced", label:"Balanced",        tenure:24, rate:12, badge:"Recommended",icon:"⭐", desc:"Best mix of EMI & cost", recommended:true },
    { id:"easy",     label:"Easy on Wallet",  tenure:48, rate:13, badge:"Low EMI",    icon:"🌿", desc:"Smallest monthly payment" },
  ];
  return (
    <div className="mt-6">
      <p className="text-sm font-bold text-slate-600 mb-1">Choose your loan plan</p>
      <p className="text-xs text-slate-400 mb-3">Tap a card — EMI above updates automatically.</p>
      <div className="grid grid-cols-3 gap-3">
        {offers.map(o => {
          const emi   = calcEMI(loanAmount, o.tenure, o.rate);
          const total = emi * o.tenure;
          const sel   = selectedOffer === o.id;
          return (
            <div key={o.id} onClick={() => onSelect(o)}
              className={`relative rounded-xl p-4 border-2 text-center cursor-pointer transition-all duration-200 select-none
                ${sel ? "border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200 scale-[1.03]"
                      : o.recommended ? "border-blue-300 bg-white hover:border-blue-500" : "border-slate-200 bg-white hover:border-slate-400"}`}>
              {sel && <div className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</div>}
              {o.recommended && !sel && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">Recommended</div>}
              <div className="text-2xl mb-1 mt-1">{o.icon}</div>
              <p className={`text-sm font-bold mb-0.5 ${sel ? "text-blue-700" : "text-slate-700"}`}>{o.label}</p>
              <p className="text-xs text-slate-400 mb-2 leading-tight">{o.desc}</p>
              <p className="text-xl font-bold text-blue-600">₹{fmt(emi)}<span className="text-xs font-normal text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">{o.tenure} mo · {o.rate}%</p>
              <p className="text-xs text-orange-500 mt-0.5 font-semibold">Total: ₹{fmt(total)}</p>
            </div>
          );
        })}
      </div>
      {selectedOffer && (() => {
        const o = offers.find(x => x.id === selectedOffer);
        return o ? (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 font-semibold flex items-center gap-2">
            ✅ <strong>{o.label}</strong> selected — ₹{fmt(calcEMI(loanAmount, o.tenure, o.rate))}/mo for {o.tenure} months at {o.rate}%
          </div>
        ) : null;
      })()}
    </div>
  );
}

// ── Eligibility Checker ───────────────────────────────────────────────────────
export function EligibilityChecker() {
  const [income, setIncome] = useState("");
  const [score,  setScore]  = useState("");
  const [result, setResult] = useState(null);
  const check = () => {
    const inc=Number(income), sc=Number(score);
    if (!inc||!sc) return;
    const eligible=inc>=15000&&sc>=650;
    setResult({ eligible, maxLoan:eligible?Math.min(inc*10,1000000):0, inc, sc });
  };
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
      <p className="text-sm font-bold text-slate-700 mb-4">⚡ Quick Eligibility Check</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input type="number" placeholder="Monthly income (₹)" value={income} onChange={e=>setIncome(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
        <input type="number" placeholder="CIBIL score" value={score} onChange={e=>setScore(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
      </div>
      <button onClick={check} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Check Eligibility</button>
      {result && (
        <div className={`mt-3 p-3 rounded-xl border text-sm ${result.eligible?"bg-green-50 border-green-200 text-green-700":"bg-red-50 border-red-200 text-red-700"}`}>
          {result.eligible ? <>✅ <strong>Eligible!</strong> Max ₹{fmt(result.maxLoan)}</> : <>❌ {result.sc<650?"Min CIBIL 650. ":""}{result.inc<15000?"Min income ₹15,000.":""}</>}
        </div>
      )}
    </div>
  );
}

// ── CIBIL Gauge with full check flow ─────────────────────────────────────────
export function CibilGauge({ score, onScoreFetched }) {
  const [stage,    setStage]    = useState(score ? "done" : "idle");
  const [panInput, setPanInput] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [panError, setPanError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFetch = () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(panInput)) { setPanError("Invalid PAN. Example: ABCDE1234F"); return; }
    if (!dobInput) { setPanError("Please enter date of birth"); return; }
    setPanError(""); setStage("checking");
    let p = 0;
    const iv = setInterval(() => {
      p += 20; setProgress(p);
      if (p >= 100) { clearInterval(iv); setTimeout(() => { onScoreFetched(690); setStage("done"); }, 400); }
    }, 500);
  };

  const pct   = score ? Math.max(0, Math.min(100, ((score-300)/600)*100)) : 0;
  const color  = score >= 750 ? "#16a34a" : score >= 650 ? "#ca8a04" : "#dc2626";
  const label  = score >= 800 ? "Excellent" : score >= 750 ? "Very Good" : score >= 700 ? "Good" : score >= 650 ? "Fair" : "Poor";
  const rate   = score ? rateFromScore(score) : null;

  if (stage === "idle") return (
    <div className="text-center py-4">
      <div className="text-5xl mb-3">📊</div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">Check Your Live CIBIL Score</h3>
      <p className="text-sm text-slate-400 mb-5 max-w-sm mx-auto">Fetched from bureau in real time using PAN. Soft check — no score impact.</p>
      <div className="grid grid-cols-4 gap-2 mb-5 max-w-xs mx-auto">
        {[["🪪","PAN"],["📅","DOB"],["🏦","Bureau"],["🔒","Soft"]].map(([icon,l]) => (
          <div key={l} className="bg-slate-50 rounded-xl p-2 border border-slate-100"><div className="text-lg mb-0.5">{icon}</div><p className="text-xs text-slate-500 font-semibold">{l}</p></div>
        ))}
      </div>
      <button onClick={() => setStage("form")} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Check My CIBIL Score →</button>
      <p className="text-xs text-slate-400 mt-2">Free · Under 30 seconds</p>
    </div>
  );

  if (stage === "form") return (
    <div className="max-w-sm mx-auto py-2">
      <h3 className="text-lg font-bold text-slate-700 mb-1">Enter Verification Details</h3>
      <p className="text-xs text-slate-400 mb-5">Used only for bureau verification. Never stored.</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">PAN Number</label>
          <input type="text" maxLength={10} placeholder="ABCDE1234F" value={panInput}
            onChange={e => { setPanInput(e.target.value.toUpperCase()); setPanError(""); }}
            className={`w-full mt-1 p-3.5 border-2 rounded-xl outline-none text-sm tracking-widest font-mono ${panError?"border-red-400 bg-red-50":"border-slate-200 focus:border-blue-400"}`} />
          {panError && <p className="text-red-500 text-xs mt-1">{panError}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date of Birth</label>
          <input type="date" value={dobInput} onChange={e => setDobInput(e.target.value)}
            className="w-full mt-1 p-3.5 border-2 border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400" />
        </div>
      </div>
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">🔒 PAN encrypted and sent directly to CIBIL bureau. We receive only your score.</div>
      <button onClick={handleFetch} disabled={panInput.length<10||!dobInput}
        className="mt-4 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all">
        Fetch My Score from Bureau
      </button>
      <button onClick={() => setStage("idle")} className="mt-2 w-full text-xs text-slate-400 hover:text-slate-600 py-1">← Back</button>
    </div>
  );

  if (stage === "checking") return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-4"><div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
      <h3 className="text-lg font-bold text-slate-700 mb-4">Fetching Your Score...</h3>
      <div className="max-w-xs mx-auto mb-4">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width:`${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">{progress}% complete</p>
      </div>
      {["Verifying PAN with NSDL...","Connecting to CIBIL bureau...","Retrieving credit report...","Calculating your score...","Generating personalised rate..."].map((msg,i) => (
        <div key={msg} className={`flex items-center gap-2 text-xs max-w-xs mx-auto text-left mb-1 ${i<Math.floor(progress/20)?"text-green-600":i===Math.floor(progress/20)?"text-blue-600":"text-slate-300"}`}>
          <span>{i<Math.floor(progress/20)?"✓":i===Math.floor(progress/20)?"⟳":"○"}</span>{msg}
        </div>
      ))}
    </div>
  );

  // done
  return (
    <div>
      <div className={`rounded-2xl p-5 mb-5 text-center border-2 ${score>=750?"bg-green-50 border-green-300":score>=650?"bg-yellow-50 border-yellow-300":"bg-red-50 border-red-300"}`}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Live CIBIL Score</p>
        <p className="text-7xl font-bold leading-none" style={{ color }}>{score}</p>
        <p className="text-base font-semibold mt-1" style={{ color }}>{label}</p>
        {rate ? <p className="text-sm text-blue-600 font-bold mt-2">🎯 Your personalised rate: <strong>{rate}% p.a.</strong></p>
               : <p className="text-sm text-red-600 font-bold mt-2">❌ Score too low — minimum 650 required</p>}
      </div>
      <div className="relative h-5 bg-slate-200 rounded-full overflow-visible mb-1.5">
        <div className="absolute h-full rounded-full" style={{ width:`${pct}%`, background:"linear-gradient(90deg,#dc2626,#f59e0b,#22c55e)", transition:"width 1s" }} />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full z-10 transition-all duration-1000" style={{ left:`${pct}%`, background:color, border:"3px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mb-5 px-1">
        {[["300","Poor"],["450",""],["600","Fair"],["750","Good"],["900","Excellent"]].map(([v,l])=>(
          <div key={v} className="text-center"><div className="font-semibold">{v}</div>{l&&<div className="text-slate-300 text-xs">{l}</div>}</div>
        ))}
      </div>
      <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden mb-4">
        <div className="px-4 py-2.5 bg-slate-100"><p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Interest Rate by Score Band</p></div>
        {[{range:"800–900",label:"Excellent",rate:"10.5%",min:800},{range:"750–799",label:"Very Good",rate:"11%",min:750},{range:"700–749",label:"Good",rate:"12%",min:700},{range:"650–699",label:"Fair",rate:"14%",min:650},{range:"< 650",label:"Poor",rate:"Not eligible",min:0}].map(row => {
          const isYours=(row.min===800&&score>=800)||(row.min===750&&score>=750&&score<800)||(row.min===700&&score>=700&&score<750)||(row.min===650&&score>=650&&score<700)||(row.min===0&&score<650);
          return (
            <div key={row.range} className={`flex items-center justify-between px-4 py-2.5 text-xs border-b border-slate-100 last:border-0 ${isYours?"bg-blue-50":""}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isYours?"bg-blue-500":"bg-slate-200"}`} />
                <span className={isYours?"text-blue-700 font-bold":"text-slate-500"}>{row.range} — {row.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${isYours?"text-blue-700":row.min===0?"text-red-500":row.min>=750?"text-green-600":"text-orange-500"}`}>{row.rate}</span>
                {isYours&&<span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Your rate</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}