import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are FinLend AI's smart loan advisor. You help users with personal loan questions.
You have access to the user's loan context which will be provided in each message.
Keep replies short (2-4 sentences max), friendly, and specific to their numbers.
Always respond in Indian Rupee context. If asked about eligibility, use their income and EMI ratio.
Never recommend illegal actions. If asked something outside finance, politely redirect.`;

const QUICK_QUESTIONS = [
  "Can I afford this loan?",
  "What if I increase tenure to 36 months?",
  "How much will I save by prepaying ₹10,000 extra/month?",
  "What CIBIL score do I need for 11% rate?",
  "When should I apply for a top-up?",
];

export function AILoanAdvisor({ loanAmount, tenure, income, emi, cibilScore, rate, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I'm your FinLend AI advisor 👋 I can see you're applying for ₹${Number(loanAmount).toLocaleString("en-IN")} over ${tenure} months at ${rate}% p.a. (EMI: ₹${Number(emi).toLocaleString("en-IN")}). How can I help you make the best decision?` }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const context = `User's loan context: Loan Amount=₹${loanAmount}, Tenure=${tenure} months, Monthly Income=₹${income||"unknown"}, EMI=₹${emi}, CIBIL Score=${cibilScore||"unknown"}, Interest Rate=${rate}% p.a., EMI-to-Income ratio=${income ? Math.round((emi/income)*100) : "unknown"}%.`;

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.role === "user" ? `${context}\n\nUser question: ${m.content}` : m.content
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Connection error. Please check your internet and try again." }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50" style={{ height: "520px" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
          <div>
            <p className="text-white font-bold text-sm">FinLend AI Advisor</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-blue-200 text-xs">Online · Powered by Claude AI</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white text-xl font-bold">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm mr-2 shrink-0 mt-0.5">🤖</div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
              ${m.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm mr-2 shrink-0">🤖</div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length < 3 && (
        <div className="px-3 py-2 bg-white border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1.5">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.slice(0, 3).map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask me anything about your loan..."
          className="flex-1 p-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
        <button onClick={() => send(input)} disabled={!input.trim() || loading}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:bg-slate-300 transition-all">
          →
        </button>
      </div>
    </div>
  );
}