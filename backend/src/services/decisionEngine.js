/**
 * Decision Engine
 * ──────────────────────────────────────────────────────────────────────────
 * Assumptions & Logic:
 *
 * 1. Revenue sufficiency:   monthly_revenue >= 15,000              → fails: LOW_REVENUE
 * 2. Minimum tenure:        tenure_months >= 3                     → fails: TENURE_TOO_SHORT
 * 3. Loan ceiling:          loan_amount <= 24 × monthly_revenue    → fails: LOAN_AMOUNT_TOO_HIGH
 * 4. EMI burden:            EMI / monthly_revenue <= 0.50          → fails: HIGH_EMI_BURDEN
 *                           where EMI = loan_amount / tenure_months
 * 5. PAN format:            must match /^[A-Z]{5}[0-9]{4}[A-Z]$/  → fails: INVALID_PAN
 * 6. Consistency check:     both loan_amount > 0 and revenue > 0   → fails: INCONSISTENT_DATA
 *
 * Credit Score:
 *   base = 600
 *   + revenue_score  : 0–100 (scales with revenue up to ₹1,00,000/month)
 *   + emi_score      : 0–100 (lower EMI ratio = higher score)
 *   + tenure_score   : 0–50  (longer tenure = better risk spread)
 *   - 25 per failed check
 *   clamped to [300, 900]
 *
 * Decision threshold: score >= 650 → APPROVED, else REJECTED
 */

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const MIN_REVENUE = 15000;
const MIN_TENURE = 3;
const LOAN_CEILING_MULTIPLIER = 24;
const MAX_EMI_RATIO = 0.50;
const APPROVAL_THRESHOLD = 650;
const PENALTY_PER_FAIL = 25;

/**
 * @param {Object} inputs
 * @param {string} inputs.pan
 * @param {number} inputs.monthlyRevenue
 * @param {number} inputs.loanAmount
 * @param {number} inputs.tenureMonths
 * @returns {{ creditScore: number, decision: 'APPROVED'|'REJECTED', reasonCodes: string[] }}
 */
const runDecisionEngine = (inputs) => {
  const { pan, monthlyRevenue, loanAmount, tenureMonths } = inputs;

  const revenue = parseFloat(monthlyRevenue);
  const amount = parseFloat(loanAmount);
  const tenure = parseInt(tenureMonths);

  const reasonCodes = [];
  let penalties = 0;

  // ── Check 1: PAN format ───────────────────────────────────────────────
  if (!pan || !PAN_REGEX.test(pan.trim().toUpperCase())) {
    reasonCodes.push('INVALID_PAN');
    penalties += PENALTY_PER_FAIL;
  }

  // ── Check 2: Revenue sufficiency ─────────────────────────────────────
  if (revenue < MIN_REVENUE) {
    reasonCodes.push('LOW_REVENUE');
    penalties += PENALTY_PER_FAIL;
  }

  // ── Check 3: Minimum tenure ───────────────────────────────────────────
  if (tenure < MIN_TENURE) {
    reasonCodes.push('TENURE_TOO_SHORT');
    penalties += PENALTY_PER_FAIL;
  }

  // ── Check 4: Consistency check ────────────────────────────────────────
  if (amount <= 0 || revenue <= 0) {
    reasonCodes.push('INCONSISTENT_DATA');
    penalties += PENALTY_PER_FAIL;
  }

  // ── Check 5: Loan ceiling ─────────────────────────────────────────────
  if (amount > LOAN_CEILING_MULTIPLIER * revenue) {
    reasonCodes.push('LOAN_AMOUNT_TOO_HIGH');
    penalties += PENALTY_PER_FAIL;
  }

  // ── Check 6: EMI burden ───────────────────────────────────────────────
  const emi = tenure > 0 ? amount / tenure : Infinity;
  const emiRatio = revenue > 0 ? emi / revenue : Infinity;

  if (emiRatio > MAX_EMI_RATIO) {
    reasonCodes.push('HIGH_EMI_BURDEN');
    penalties += PENALTY_PER_FAIL;
  }

  // ── Credit Score Calculation ──────────────────────────────────────────
  const revenueScore = Math.min(revenue / 100000, 1) * 100;            // 0–100
  const emiScore = emiRatio < Infinity ? Math.max(0, (1 - emiRatio / MAX_EMI_RATIO)) * 100 : 0; // 0–100
  const tenureScore = Math.min(tenure / 60, 1) * 50;                   // 0–50, max at 5 years

  const rawScore = 600 + revenueScore + emiScore + tenureScore - penalties;
  const creditScore = Math.max(300, Math.min(900, Math.round(rawScore)));

  const decision = creditScore >= APPROVAL_THRESHOLD ? 'APPROVED' : 'REJECTED';

  return { creditScore, decision, reasonCodes };
};

module.exports = { runDecisionEngine };
