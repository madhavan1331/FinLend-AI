export const validators = {
  fullName:  (v) => v.trim().length >= 3 ? "" : "Enter at least 3 characters",
  pan:       (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v) ? "" : "Invalid PAN (e.g. ABCDE1234F)",
  mobile:    (v) => /^[6-9]\d{9}$/.test(v) ? "" : "Enter valid 10-digit mobile",
  email:     (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter valid email",
  accountNo: (v) => /^\d{9,18}$/.test(v) ? "" : "Enter valid account number",
  ifsc:      (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(v) ? "" : "Invalid IFSC (e.g. SBIN0001234)",
  pincode:   (v) => /^\d{6}$/.test(v) ? "" : "Enter valid 6-digit pincode",
  income:    (v) => Number(v) >= 15000 ? "" : "Minimum income ₹15,000",
  employer:  (v) => v.trim().length >= 2 ? "" : "Enter employer name",
};

export function calcEMI(principal, tenureMonths, ratePercent = 12) {
  if (!principal || !tenureMonths) return 0;
  const r = ratePercent / 12 / 100;
  const n = tenureMonths;
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

export function fmt(n) {
  return Number(n).toLocaleString("en-IN");
}

export function rateFromScore(score) {
  if (score >= 800) return 10.5;
  if (score >= 750) return 11;
  if (score >= 700) return 12;
  if (score >= 650) return 14;
  return null;
}

// Financial Health Score: 0-100
export function calcFinScore({ cibilScore, income, emi, onTimePayments, totalPayments }) {
  let score = 0;
  // CIBIL contribution (40 pts)
  if (cibilScore >= 800) score += 40;
  else if (cibilScore >= 750) score += 32;
  else if (cibilScore >= 700) score += 24;
  else if (cibilScore >= 650) score += 16;
  // Income vs EMI ratio (30 pts)
  const ratio = income > 0 ? emi / income : 1;
  if (ratio < 0.2) score += 30;
  else if (ratio < 0.3) score += 22;
  else if (ratio < 0.4) score += 14;
  else score += 6;
  // Repayment streak (30 pts)
  const pct = totalPayments > 0 ? onTimePayments / totalPayments : 1;
  score += Math.round(pct * 30);
  return Math.min(100, score);
}