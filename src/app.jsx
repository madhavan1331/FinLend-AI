import { useState, useEffect, useCallback } from "react";
import { Sidebar, MobileBottomNav, MobileHeader, useDarkMode } from "./components/Responsive";
import { RightPanel } from "./components/RightPanel";
import { CibilGauge, EMIBreakdown, LoanOfferComparison, EligibilityChecker } from "./components/FinanceTools";
import { DisbursementDashboard } from "./components/Dashboard";
import { VideoKYC } from "./components/Features1";
import { AILoanAdvisor } from "./components/AILoanAdvisor";
import { SmartLoanRecommender } from "./components/SmartFeatures";
import { Field, SelectField, InfoBox, DocUpload, ReviewSection, Skeleton } from "./components/ui";
import { validators, calcEMI, fmt, rateFromScore } from "./utils/helpers";

export default function App() {
  // FEATURE 1: Persistent dark mode (saved to localStorage)
  const [darkMode, setDarkMode] = useDarkMode();

  const [step,        setStep]        = useState(0);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [showAI,      setShowAI]      = useState(false);

  // Auth
  const [loginMobile, setLoginMobile] = useState("");
  const [otpSent,     setOtpSent]     = useState(false);
  const [otpValue,    setOtpValue]    = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [mpinStep,    setMpinStep]    = useState("none");
  const [mpinValue,   setMpinValue]   = useState("");
  const [mpinConfirm, setMpinConfirm] = useState("");

  // Consents
  const [consents, setConsents] = useState({ cibil:false, sharing:false, terms:false, marketing:false });

  // Loan offer selection
  const [selectedOffer, setSelectedOffer] = useState("balanced");

  // CIBIL score + derived rate
  const [cibilScore, setCibilScore] = useState(null);
  const [activeRate, setActiveRate] = useState(12);

  // Video KYC
  const [videoKYCDone, setVideoKYCDone] = useState(false);

  // Documents
  const [digilockerDone, setDigilockerDone] = useState(false);
  const [uploaded,       setUploaded]       = useState({});

  // E-Sign / NACH
  const [eSignDone, setESignDone] = useState(false);
  const [nachDone,  setNachDone]  = useState(false);
  const [nachMethod,setNachMethod]= useState("upi");

  // Draft saved
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    if (step > 1) { const t = setTimeout(() => setDraftSaved(true), 1500); return () => clearTimeout(t); }
  }, [step]);

  const [formData, setFormData] = useState({
    loanAmount: 200000, tenure: 24, purpose: "personal",
    fullName: "", pan: "", mobile: "", email: "", dob: "", gender: "",
    empType: "salaried", employer: "", designation: "", experience: "1-3", industry: "", workEmail: "",
    income: "", otherIncome: "", incomeMode: "salary", itrAmount: "",
    currentAddress: "", permanentAddress: "", pincode: "", sameAddress: false, residenceType: "",
    accountNo: "", ifsc: "", bankStatement: "3months",
    coApplicant: false, coName: "", coPan: "", coMobile: "",
  });

  // FEATURE 2: Selectable offer cards update tenure
  const handleOfferSelect = (offer) => {
    setSelectedOffer(offer.id);
    setFormData(p => ({ ...p, tenure: offer.tenure }));
    if (offer.rate !== activeRate && !cibilScore) setActiveRate(offer.rate);
  };

  // FEATURE 3: Smart recommender applies suggestion
  const handleRecommendationApply = (amount, tenure) => {
    setFormData(p => ({ ...p, loanAmount: amount, tenure }));
  };

  const handleScoreFetched = (score) => {
    setCibilScore(score);
    const r = rateFromScore(score);
    if (r) setActiveRate(r);
  };

  const emi       = calcEMI(Number(formData.loanAmount), Number(formData.tenure), activeRate);
  const emiValid  = emi >= 3000;
  const cibilValid= cibilScore !== null && cibilScore >= 650;
  const allConsent= Object.values(consents).every(Boolean);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData(p => ({ ...p, [name]: val }));
    if (validators[name]) setErrors(p => ({ ...p, [name]: validators[name](String(val)) }));
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (validators[name]) setErrors(p => ({ ...p, [name]: validators[name](value) }));
  };

  const canContinue = () => {
    if (step === 0)  return otpVerified && mpinStep === "done";
    if (step === 1)  return emiValid && !!selectedOffer;
    if (step === 2)  return allConsent && formData.fullName && !errors.fullName && formData.pan && !errors.pan && formData.mobile && !errors.mobile && formData.email && !errors.email;
    if (step === 3)  return cibilValid;
    if (step === 4)  return !!formData.employer;
    if (step === 5)  return !!formData.income && !errors.income;
    if (step === 6)  return !!formData.currentAddress && !!formData.pincode && !errors.pincode;
    if (step === 7)  return !!formData.accountNo && !errors.accountNo && !!formData.ifsc && !errors.ifsc;
    if (step === 8)  return (digilockerDone && uploaded.salary && uploaded.photo) || (uploaded.aadhaar && uploaded.pan && uploaded.salary && uploaded.photo);
    if (step === 9)  return videoKYCDone;
    if (step === 10) return eSignDone;
    if (step === 11) return nachDone;
    return true;
  };

  const nextStep = () => { setLoading(true); setTimeout(() => { setLoading(false); if (step < 13) setStep(step + 1); }, 500); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  // Responsive classes
  const bg    = darkMode ? "bg-gray-900"  : "bg-slate-100";
  const card  = darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-slate-800 border-slate-100";
  const text  = darkMode ? "text-gray-100" : "text-slate-800";
  const sub   = darkMode ? "text-gray-400" : "text-slate-500";

  return (
    <div className={`min-h-screen flex ${bg} transition-colors duration-300`}>

      {/* FEATURE: Mobile header — visible only on small screens */}
      <MobileHeader step={step} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* FEATURE: Sidebar — hidden on mobile, visible on md+ */}
      <Sidebar step={step} darkMode={darkMode} />

      {/* Main content — padded top on mobile for header, left on desktop for sidebar */}
      <div className="flex-1 md:ml-52 pt-16 md:pt-0 pb-20 md:pb-0 p-4 md:p-8">

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between mb-2">
          <div>
            <h1 className={`text-4xl font-bold ${text}`}>Personal Loan Journey</h1>
            <p className={`text-sm ${sub}`}>Complete onboarding, underwriting and disbursement workflow</p>
          </div>
          <div className="flex items-center gap-2">
            {cibilScore && step > 3 && (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-blue-500 font-semibold">CIBIL</span>
                <span className="text-sm font-bold text-blue-700">{cibilScore}</span>
                <span className="text-xs text-blue-500">· {activeRate}%</span>
              </div>
            )}
            {draftSaved && step > 1 && step < 13 && (
              <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">✓ Draft saved</span>
            )}
            <button onClick={() => setDarkMode(d => !d)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${card} border`}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* Mobile page title */}
        <div className="md:hidden mb-3">
          <p className={`text-lg font-bold ${text}`}>Personal Loan Journey</p>
          {cibilScore && step > 3 && (
            <span className="text-xs text-blue-600 font-semibold">CIBIL {cibilScore} · {activeRate}% rate</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="flex-1 bg-slate-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-700" style={{ width: `${(step / 13) * 100}%` }} />
          </div>
          <span className={`text-xs font-bold ${sub} shrink-0`}>{Math.round((step / 13) * 100)}%</span>
        </div>

        {/* RESPONSIVE LAYOUT: single col on mobile, 3-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main card */}
          <div className={`md:col-span-2 rounded-3xl shadow-xl p-5 md:p-8 border ${card}`}>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (<>

              {/* ── STEP 0: OTP + MPIN ── */}
              {step === 0 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-1 ${text}`}>Welcome to FinLend AI</h2>
                <p className={`text-sm mb-6 ${sub}`}>Verify your mobile number to get started</p>
                {!otpSent && (<div className="max-w-sm">
                  <EligibilityChecker />
                  <div className="mt-5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mobile Number</label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={loginMobile}
                      onChange={e => setLoginMobile(e.target.value)}
                      className="w-full mt-1 p-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" />
                    <button onClick={() => setOtpSent(true)} disabled={loginMobile.length < 10}
                      className="mt-3 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all">
                      Send OTP
                    </button>
                  </div>
                </div>)}
                {otpSent && !otpVerified && (<div className="max-w-sm">
                  <InfoBox type="info" className="mb-4">OTP sent to <strong>{loginMobile}</strong>. Valid for 10 minutes.</InfoBox>
                  <input type="text" maxLength={6} placeholder="• • • • • •" value={otpValue}
                    onChange={e => setOtpValue(e.target.value)}
                    className="w-full p-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 text-xl text-center tracking-widest" />
                  <button onClick={() => setOtpVerified(true)} disabled={otpValue.length < 4}
                    className="mt-3 w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-slate-300">Verify OTP</button>
                  <button onClick={() => setOtpSent(false)} className="mt-2 w-full text-xs text-slate-400 hover:text-slate-600">← Change number</button>
                </div>)}
                {otpVerified && mpinStep === "none" && (<div className="max-w-sm">
                  <InfoBox type="success" className="mb-4">✅ Mobile verified!</InfoBox>
                  <button onClick={() => setMpinStep("set")} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Set 4-digit MPIN</button>
                </div>)}
                {otpVerified && mpinStep === "set" && (<div className="max-w-sm">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Create MPIN (4–6 digits)</label>
                  <input type="password" maxLength={6} placeholder="••••" value={mpinValue}
                    onChange={e => setMpinValue(e.target.value)}
                    className="w-full mt-1 p-3.5 border-2 border-slate-200 rounded-xl text-xl text-center tracking-widest outline-none" />
                  <button onClick={() => setMpinStep("confirm")} disabled={mpinValue.length < 4}
                    className="mt-3 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold disabled:bg-slate-300">Next</button>
                </div>)}
                {otpVerified && mpinStep === "confirm" && (<div className="max-w-sm">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Confirm MPIN</label>
                  <input type="password" maxLength={6} placeholder="••••" value={mpinConfirm}
                    onChange={e => setMpinConfirm(e.target.value)}
                    className="w-full mt-1 p-3.5 border-2 border-slate-200 rounded-xl text-xl text-center tracking-widest outline-none" />
                  {mpinConfirm && mpinConfirm !== mpinValue && <p className="text-red-500 text-xs mt-1">MPINs don't match</p>}
                  <button onClick={() => setMpinStep("done")} disabled={mpinConfirm !== mpinValue || mpinConfirm.length < 4}
                    className="mt-3 w-full py-3.5 bg-green-600 text-white rounded-xl font-bold disabled:bg-slate-300">Confirm MPIN</button>
                </div>)}
                {otpVerified && mpinStep === "done" && (<div className="max-w-sm">
                  <InfoBox type="success">✅ <strong>All set!</strong> MPIN created. Click Continue.</InfoBox>
                </div>)}
              </div>)}

              {/* ── STEP 1: LOAN CONFIG + SMART RECOMMENDER ── */}
              {step === 1 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${text}`}>Loan Configuration</h2>
                {[
                  { name:"loanAmount", label:"Loan Amount", min:50000, max:1000000, step:10000, display: v=>`₹${fmt(v)}` },
                  { name:"tenure",     label:"Tenure",      min:6,     max:60,      step:6,     display: v=>`${v} Months` },
                ].map(s => (
                  <div key={s.name} className="mb-7">
                    <div className="flex justify-between mb-2">
                      <label className={`font-semibold text-sm ${sub}`}>{s.label}</label>
                      <span className="font-bold text-blue-600">{s.display(formData[s.name])}</span>
                    </div>
                    <input type="range" name={s.name} min={s.min} max={s.max} step={s.step}
                      value={formData[s.name]} onChange={handleChange} className="w-full accent-blue-600" />
                    <div className={`flex justify-between text-xs ${sub} mt-1`}>
                      <span>{s.display(s.min)}</span><span>{s.display(s.max)}</span>
                    </div>
                  </div>
                ))}
                <SelectField label="Purpose of Loan" name="purpose" value={formData.purpose} onChange={handleChange} className="mb-4"
                  options={[
                    {value:"personal",label:"Personal/Family"},{value:"medical",label:"Medical Emergency"},
                    {value:"education",label:"Education"},{value:"travel",label:"Travel"},
                    {value:"home",label:"Home Renovation"},{value:"wedding",label:"Wedding"},{value:"business",label:"Business"},
                  ]} />
                {/* FEATURE: Smart Loan Recommender */}
                <SmartLoanRecommender
                  purpose={formData.purpose}
                  currentAmount={Number(formData.loanAmount)}
                  currentTenure={Number(formData.tenure)}
                  rate={activeRate}
                  onApply={handleRecommendationApply}
                />
                <div className="mt-5">
                  <EMIBreakdown loanAmount={Number(formData.loanAmount)} tenure={Number(formData.tenure)} rate={activeRate} />
                </div>
                <LoanOfferComparison loanAmount={Number(formData.loanAmount)} selectedOffer={selectedOffer} onSelect={handleOfferSelect} />
                {!emiValid && <InfoBox type="error" className="mt-4">EMI must be ≥ ₹3,000. Increase amount or reduce tenure.</InfoBox>}
              </div>)}

              {/* ── STEP 2: PERSONAL INFO ── */}
              {step === 2 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${text}`}>Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} errors={errors} placeholder="As per PAN card" />
                  <Field label="PAN Number" name="pan" value={formData.pan}
                    onChange={e => handleChange({target:{name:"pan",value:e.target.value.toUpperCase()}})}
                    onBlur={handleBlur} errors={errors} placeholder="ABCDE1234F" />
                  <Field label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} onBlur={handleBlur} errors={errors} />
                  <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} errors={errors} />
                  <SelectField label="Birth Year" name="dob" value={formData.dob} onChange={handleChange}
                    options={[{value:"",label:"Select year"},...[...Array(50)].map((_,i)=>({value:1975+i,label:String(1975+i)}))]} />
                  <SelectField label="Gender" name="gender" value={formData.gender||""} onChange={handleChange}
                    options={[{value:"",label:"Select"},{value:"male",label:"Male"},{value:"female",label:"Female"},{value:"other",label:"Other"}]} />
                </div>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-4">
                  <p className="text-sm font-bold text-slate-700 mb-3">🔒 Consent & Permissions</p>
                  {[
                    {key:"cibil",   label:"I authorise FinLend AI to pull my CIBIL report for credit assessment."},
                    {key:"sharing", label:"I consent to sharing my data with lending partners for loan processing."},
                    {key:"terms",   label:"I agree to the Terms & Conditions and Privacy Policy."},
                    {key:"marketing",label:"I'd like to receive loan offers and updates (optional)."},
                  ].map(c => (
                    <label key={c.key} className="flex items-start gap-3 mb-3 cursor-pointer">
                      <input type="checkbox" checked={consents[c.key]}
                        onChange={e => setConsents(p => ({...p,[c.key]:e.target.checked}))}
                        className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0" />
                      <span className="text-xs text-slate-600">{c.label}</span>
                    </label>
                  ))}
                  {!allConsent && <p className="text-xs text-red-500">Please accept all required consents.</p>}
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="coApplicant" checked={formData.coApplicant} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Add co-applicant (improves eligibility)</span>
                  </label>
                  {formData.coApplicant && (<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <Field label="Name" name="coName" value={formData.coName} onChange={handleChange} errors={{}} />
                    <Field label="PAN" name="coPan" value={formData.coPan} onChange={handleChange} errors={{}} />
                    <Field label="Mobile" name="coMobile" value={formData.coMobile} onChange={handleChange} errors={{}} />
                  </div>)}
                </div>
              </div>)}

              {/* ── STEP 3: CIBIL ── */}
              {step === 3 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-1 ${text}`}>CIBIL Score Check</h2>
                <p className={`text-sm mb-5 ${sub}`}>Soft check — zero impact on your credit score.</p>
                <CibilGauge score={cibilScore} onScoreFetched={handleScoreFetched} />
                {cibilScore !== null && (
                  <div className={`mt-5 p-5 rounded-2xl border ${cibilValid?"bg-green-50 border-green-200":"bg-red-50 border-red-200"}`}>
                    {cibilValid
                      ? <><h3 className="text-xl font-bold text-green-700 mb-1">✅ Eligible for Underwriting</h3><p className="text-sm text-green-600">Rate locked at <strong>{activeRate}% p.a.</strong></p></>
                      : <><h3 className="text-xl font-bold text-red-700 mb-1">❌ Below Minimum Threshold</h3><p className="text-sm text-red-600">Minimum score is 650.</p></>}
                  </div>
                )}
              </div>)}

              {/* ── STEP 4: EMPLOYMENT ── */}
              {step === 4 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${text}`}>Employment Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Employment Type" name="empType" value={formData.empType} onChange={handleChange}
                    options={[{value:"salaried",label:"Salaried"},{value:"self",label:"Self Employed"},{value:"business",label:"Business Owner"}]} />
                  <Field label="Employer/Company" name="employer" value={formData.employer} onChange={handleChange} onBlur={handleBlur} errors={errors} />
                  <Field label="Designation" name="designation" value={formData.designation||""} onChange={handleChange} errors={{}} placeholder="e.g. Software Engineer" />
                  <SelectField label="Experience" name="experience" value={formData.experience} onChange={handleChange}
                    options={[{value:"0-1",label:"< 1 year"},{value:"1-3",label:"1–3 years"},{value:"3-5",label:"3–5 years"},{value:"5+",label:"5+ years"}]} />
                  <SelectField label="Industry" name="industry" value={formData.industry||""} onChange={handleChange}
                    options={[{value:"",label:"Select"},{value:"it",label:"IT/Technology"},{value:"finance",label:"Finance"},{value:"healthcare",label:"Healthcare"},{value:"education",label:"Education"},{value:"govt",label:"Government"},{value:"other",label:"Other"}]} />
                  <Field label="Work Email" name="workEmail" type="email" value={formData.workEmail||""} onChange={handleChange} errors={{}} placeholder="you@company.com" />
                </div>
                {formData.empType === "self" && <InfoBox type="warning" className="mt-4">Self-employed must upload ITR for last 2 years in Documents.</InfoBox>}
              </div>)}

              {/* ── STEP 5: INCOME ── */}
              {step === 5 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${text}`}>Income Details</h2>
                <p className={`text-sm mb-5 ${sub}`}>All income fields — filled once only.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Income Mode</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {[["salary","Salary"],["business","Business"],["freelance","Freelance"]].map(([val,lbl]) => (
                        <button key={val} onClick={() => setFormData(p => ({...p, incomeMode:val}))}
                          className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${formData.incomeMode===val?"border-blue-600 bg-blue-50 text-blue-700":"border-slate-200 text-slate-500"}`}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <Field label="Monthly Income (₹)" name="income" type="number" value={formData.income} onChange={handleChange} onBlur={handleBlur} errors={errors} placeholder="e.g. 50000" />
                  <Field label="Other Monthly Income (₹)" name="otherIncome" type="number" value={formData.otherIncome} onChange={handleChange} errors={{}} placeholder="Rental, freelance (optional)" />
                  {formData.empType !== "salaried" && <Field label="Annual ITR Amount (₹)" name="itrAmount" type="number" value={formData.itrAmount||""} onChange={handleChange} errors={{}} placeholder="From last filed ITR" />}
                  {formData.income && !errors.income && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-blue-700 mb-3">📊 Eligibility Estimate</p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        {[
                          ["Max Loan",`₹${fmt(Number(formData.income)*10)}`,"text-blue-700"],
                          ["Max EMI (40%)",`₹${fmt(Math.round(formData.income*0.4))}`,"text-green-700"],
                          ["Your EMI",`₹${fmt(emi)}`,emi<=formData.income*0.4?"text-green-700":"text-red-600"],
                        ].map(([l,v,c]) => (
                          <div key={l} className="bg-white rounded-lg p-2.5 border border-blue-100">
                            <p className="text-slate-400 mb-1">{l}</p><p className={`font-bold ${c}`}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>)}

              {/* ── STEP 6: ADDRESS ── */}
              {step === 6 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${text}`}>Address Details</h2>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Address</label>
                    <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange}
                      placeholder="House no., Street, Area, City" rows={3}
                      className="w-full p-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 resize-none text-sm" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="sameAddress" checked={formData.sameAddress} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm text-slate-600">Permanent address same as current</span>
                  </label>
                  {!formData.sameAddress && (<div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Permanent Address</label>
                    <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} rows={3}
                      className="w-full p-3.5 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 resize-none text-sm" />
                  </div>)}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="PIN Code" name="pincode" value={formData.pincode} onChange={handleChange} onBlur={handleBlur} errors={errors} placeholder="6-digit PIN" />
                    <SelectField label="Residence Type" name="residenceType" value={formData.residenceType||""} onChange={handleChange}
                      options={[{value:"",label:"Select"},{value:"owned",label:"Owned"},{value:"rented",label:"Rented"},{value:"family",label:"Family-owned"}]} />
                  </div>
                  {formData.pincode && !errors.pincode && <InfoBox type="success">PIN verified — Mumbai, Maharashtra</InfoBox>}
                </div>
              </div>)}

              {/* ── STEP 7: BANK ── */}
              {step === 7 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${text}`}>Bank Details</h2>
                <div className="space-y-4">
                  <Field label="Account Number" name="accountNo" value={formData.accountNo} onChange={handleChange} onBlur={handleBlur} errors={errors} />
                  <Field label="IFSC Code" name="ifsc" value={formData.ifsc}
                    onChange={e => handleChange({target:{name:"ifsc",value:e.target.value.toUpperCase()}})}
                    onBlur={handleBlur} errors={errors} placeholder="e.g. SBIN0001234" />
                  {formData.ifsc && !errors.ifsc && <InfoBox type="success">✅ Bank: State Bank of India — verified</InfoBox>}
                  <SelectField label="Statement Period" name="bankStatement" value={formData.bankStatement} onChange={handleChange}
                    options={[{value:"3months",label:"Last 3 Months"},{value:"6months",label:"Last 6 Months"}]} />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Upload Bank Statement</label>
                    <input type="file" className="w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 cursor-pointer" />
                  </div>
                  <InfoBox type="info">Account must be active for at least 3 months and in your name.</InfoBox>
                </div>
              </div>)}

              {/* ── STEP 8: DOCUMENTS ── */}
              {step === 8 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${text}`}>Upload Documents</h2>
                <p className={`text-sm mb-4 ${sub}`}>Step 1: Fetch govt IDs via DigiLocker. Step 2: Upload salary slip & photo manually.</p>
                <button onClick={() => {setDigilockerDone(true); setUploaded(p => ({...p, aadhaar:true, pan:true}));}}
                  className={`w-full flex items-center justify-center gap-3 py-4 mb-4 rounded-xl border-2 font-bold text-sm transition-all
                    ${digilockerDone ? "border-green-400 bg-green-50 text-green-700" : "border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                  <span className="text-2xl">🏛️</span>
                  {digilockerDone ? "✅ DigiLocker — Aadhaar & PAN fetched!" : "Fetch Aadhaar & PAN from DigiLocker"}
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">or upload manually</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="space-y-3 mb-4">
                  <DocUpload name="aadhaar" label="Aadhaar Card" uploaded={uploaded} onUpload={n => setUploaded(p => ({...p,[n]:true}))} />
                  <DocUpload name="pan" label="PAN Card" uploaded={uploaded} onUpload={n => setUploaded(p => ({...p,[n]:true}))} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Step 2 — Upload Manually</p>
                <InfoBox type="warning" className="mb-3">Salary slips and passport photos are not available via DigiLocker. Upload directly.</InfoBox>
                <div className="space-y-3">
                  <DocUpload name="salary" label="Latest Salary Slip" uploaded={uploaded} onUpload={n => setUploaded(p => ({...p,[n]:true}))} />
                  <DocUpload name="photo" label="Passport Photo (recent)" uploaded={uploaded} onUpload={n => setUploaded(p => ({...p,[n]:true}))} />
                  {formData.empType === "self" && <DocUpload name="itr" label="ITR — Last 2 Years" uploaded={uploaded} onUpload={n => setUploaded(p => ({...p,[n]:true}))} />}
                </div>
                {!canContinue() && <InfoBox type="error" className="mt-4">All 4 documents required to continue.</InfoBox>}
              </div>)}

              {/* ── STEP 9: VIDEO KYC ── */}
              {step === 9 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${text}`}>Video KYC</h2>
                <p className={`text-sm mb-5 ${sub}`}>30-second selfie verification — RBI compliant.</p>
                <VideoKYC onComplete={() => setVideoKYCDone(true)} />
                {videoKYCDone && <InfoBox type="success" className="mt-4">Video KYC complete! Click Continue.</InfoBox>}
              </div>)}

              {/* ── STEP 10: E-SIGN ── */}
              {step === 10 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${text}`}>E-Sign Loan Agreement</h2>
                <p className={`text-sm mb-5 ${sub}`}>Review your agreement before signing</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5 max-h-48 overflow-y-auto text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold mb-2 text-sm">LOAN AGREEMENT — FinLend AI Private Limited</p>
                  <p>This Agreement is between FinLend AI Private Limited and <strong>{formData.fullName || "the Applicant"}</strong>.</p>
                  <p className="mt-2"><strong>Amount:</strong> ₹{fmt(formData.loanAmount)} · <strong>Tenure:</strong> {formData.tenure} mo · <strong>EMI:</strong> ₹{fmt(emi)} · <strong>Rate:</strong> {activeRate}% p.a.</p>
                  <p className="mt-2">Late payment attracts ₹500. Prepayment after 6 EMIs with 2% charge. By signing you confirm all information is accurate.</p>
                </div>
                {!eSignDone
                  ? (<div className="space-y-3">
                      <InfoBox type="warning">OTP will be sent to your Aadhaar-linked mobile.</InfoBox>
                      <button onClick={() => setESignDone(true)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Proceed to E-Sign via Aadhaar OTP</button>
                    </div>)
                  : <InfoBox type="success"><strong>Agreement Signed!</strong> Recorded on {new Date().toLocaleDateString("en-IN")}.</InfoBox>}
              </div>)}

              {/* ── STEP 11: NACH ── */}
              {step === 11 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${text}`}>NACH Mandate Setup</h2>
                <p className={`text-sm mb-5 ${sub}`}>Set up auto-debit for hassle-free EMI payments</p>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[{id:"upi",label:"UPI Autopay",icon:"📱"},{id:"netbanking",label:"Net Banking",icon:"🏦"},{id:"debit",label:"Debit Card",icon:"💳"}].map(m => (
                    <button key={m.id} onClick={() => setNachMethod(m.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${nachMethod===m.id?"border-blue-500 bg-blue-50":"border-slate-200 bg-white"}`}>
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-xs font-bold text-slate-700">{m.label}</p>
                    </button>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
                  {[["EMI Amount",`₹${fmt(emi)}`],["Debit Date","5th of every month"],["First EMI","30 days from disbursement"],["Account",`XXXX${(formData.accountNo||"0000").slice(-4)}`]].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className={sub}>{k}</span><span className={`font-bold ${text}`}>{v}</span>
                    </div>
                  ))}
                </div>
                {!nachDone
                  ? <button onClick={() => setNachDone(true)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Confirm Mandate</button>
                  : <InfoBox type="success"><strong>Mandate Registered!</strong> Auto-debit of ₹{fmt(emi)} set for 5th every month.</InfoBox>}
              </div>)}

              {/* ── STEP 12: REVIEW ── */}
              {step === 12 && (<div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${text}`}>Review & Submit</h2>
                <p className={`text-sm mb-5 ${sub}`}>Verify all details before final submission.</p>
                <ReviewSection title="Loan Details" onEdit={() => setStep(1)} fields={[["Amount",`₹${fmt(formData.loanAmount)}`],["Tenure",`${formData.tenure} mo`],["EMI",`₹${fmt(emi)}`],["Rate",`${activeRate}%`]]} />
                <ReviewSection title="Personal Info" onEdit={() => setStep(2)} fields={[["Name",formData.fullName],["PAN",formData.pan],["Mobile",formData.mobile],["Email",formData.email]]} />
                <ReviewSection title="Employment" onEdit={() => setStep(4)} fields={[["Type",formData.empType],["Employer",formData.employer],["Experience",formData.experience]]} />
                <ReviewSection title="Income" onEdit={() => setStep(5)} fields={[["Monthly",formData.income?`₹${fmt(formData.income)}`:"—"],["Other",formData.otherIncome?`₹${fmt(formData.otherIncome)}`:"—"]]} />
                <ReviewSection title="Bank" onEdit={() => setStep(7)} fields={[["Account",formData.accountNo?`XXXX${formData.accountNo.slice(-4)}`:"—"],["IFSC",formData.ifsc]]} />
                <InfoBox type="warning" className="mb-5">By submitting you confirm all details are accurate.</InfoBox>
                <button onClick={nextStep} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg">Submit Application →</button>
              </div>)}

              {/* ── STEP 13: DASHBOARD ── */}
              {step === 13 && (
                <DisbursementDashboard
                  loanAmount={formData.loanAmount}
                  tenure={formData.tenure}
                  rate={activeRate}
                  mobile={formData.mobile}
                  userName={formData.fullName}
                  cibilScore={cibilScore}
                />
              )}

              {/* Nav buttons */}
              {step < 13 && step !== 12 && (
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} disabled={step === 0}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${darkMode?"bg-gray-700 text-gray-200":"bg-slate-200 text-slate-700 hover:bg-slate-300"} disabled:opacity-30`}>
                    ← Back
                  </button>
                  <button onClick={nextStep} disabled={!canContinue()}
                    className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md ${canContinue()?"bg-blue-600 hover:bg-blue-700":"bg-slate-300 cursor-not-allowed"}`}>
                    Continue →
                  </button>
                </div>
              )}
            </>)}
          </div>

          {/* Right panel — hidden on mobile */}
          <div className="hidden md:block">
            <RightPanel step={step} formData={formData} darkMode={darkMode} cibilScore={cibilScore} activeRate={activeRate} />
          </div>
        </div>
      </div>

      {/* FEATURE: Mobile bottom navigation */}
      <MobileBottomNav step={step} setStep={setStep} darkMode={darkMode} />

      {/* AI Advisor */}
      <AILoanAdvisor
        isOpen={showAI} onClose={() => setShowAI(false)}
        loanAmount={formData.loanAmount} tenure={formData.tenure}
        income={formData.income} emi={emi}
        cibilScore={cibilScore} rate={activeRate}
      />

      {/* Single floating AI button */}
      <div className="fixed bottom-20 md:bottom-6 right-6">
        <button onClick={() => setShowAI(!showAI)}
          className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl text-xl hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center"
          title="AI Loan Advisor">🤖</button>
      </div>
    </div>
  );
}
