import type { FireInputs, FireResults, CalculationParams } from './types';

// ─── Formatting Helpers ───────────────────────────────────────────────────────

/** Format a number as GBP currency, rounded to 2 decimal places */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** Format a percentage to 1 decimal place */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Format a Date as "Month Year" (e.g. "March 2031") */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// ─── Core Calculations ────────────────────────────────────────────────────────

/**
 * Calculate the FIRE number — the total portfolio value needed to retire.
 *
 * FIRE Number = Annual Expenses × (100 / Withdrawal Rate)
 */
export function calcFireNumber(monthlySpending: number, withdrawalRate: number): number {
  if (withdrawalRate <= 0) return Infinity;
  const annualExpenses = monthlySpending * 12;
  const multiplier = 100 / withdrawalRate;
  return annualExpenses * multiplier;
}

/**
 * Calculate years to FIRE using the future value of a growing annuity formula.
 *
 * We solve for t in:
 *   PV × (1 + r)^t + PMT × ((1 + r)^t - 1) / r = FV
 *
 * Where:
 *   PV  = currentNetWorth
 *   PMT = monthlyContributions (monthly)
 *   r   = monthly return rate (annualRate / 12)
 *   FV  = fireNumber
 *
 * Edge cases handled:
 *  - 0% return: linear projection
 *  - Already at/above FIRE: returns 0
 *  - Cannot reach FIRE (no contributions, 0 return, below target): returns null
 *  - Hard cap at 100 years to prevent infinite loops
 */
export function calcYearsToFire(params: CalculationParams): number | null {
  const { currentNetWorth, monthlyContributions, annualReturnRate, fireNumber } = params;

  // Already at FIRE
  if (currentNetWorth >= fireNumber) return 0;

  // 0% return special case — purely linear savings
  if (annualReturnRate === 0) {
    const gap = fireNumber - currentNetWorth;
    if (monthlyContributions <= 0) return null;
    return gap / monthlyContributions / 12;
  }

  const monthlyRate = annualReturnRate / 12;
  const maxMonths = 100 * 12; // safety cap: 100 years

  // Simulate month-by-month growth
  let portfolio = currentNetWorth;
  for (let month = 1; month <= maxMonths; month++) {
    portfolio = portfolio * (1 + monthlyRate) + monthlyContributions;
    if (portfolio >= fireNumber) {
      return month / 12;
    }
  }

  // If contributions are 0 and we haven't reached FIRE, it's unreachable
  return null;
}

/**
 * Calculate the savings rate as a percentage of gross monthly income.
 * Returns 0 if income is 0 or negative.
 */
export function calcSavingsRate(monthlyContributions: number, monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 0;
  return (monthlyContributions / monthlyIncome) * 100;
}

// ─── Main Calculation Orchestrator ───────────────────────────────────────────

/**
 * Run all FIRE calculations from user inputs.
 * Returns a complete FireResults object.
 */
export function calculateFire(inputs: FireInputs): FireResults {
  const {
    monthlySpending,
    withdrawalRate,
    currentNetWorth,
    monthlyIncome,
    monthlyContributions,
    expectedReturn,
  } = inputs;

  const annualExpenses = monthlySpending * 12;
  const fireNumber = calcFireNumber(monthlySpending, withdrawalRate);
  const gapToFire = Math.max(0, fireNumber - currentNetWorth);
  const alreadyFire = currentNetWorth >= fireNumber;

  // Progress: clamp to 0–100
  const progressPercent = fireNumber > 0
    ? Math.min(100, (currentNetWorth / fireNumber) * 100)
    : 0;

  const savingsRate = calcSavingsRate(monthlyContributions, monthlyIncome);

  const yearsToFire = alreadyFire
    ? 0
    : calcYearsToFire({
        currentNetWorth,
        monthlyContributions,
        annualReturnRate: expectedReturn / 100,
        fireNumber,
      });

  // Project the FIRE date from today
  let projectedFireDate: Date | null = null;
  if (yearsToFire !== null && !alreadyFire) {
    const date = new Date();
    const totalMonths = Math.round(yearsToFire * 12);
    date.setMonth(date.getMonth() + totalMonths);
    projectedFireDate = date;
  } else if (alreadyFire) {
    projectedFireDate = new Date(); // already there
  }

  return {
    annualExpenses,
    fireNumber,
    gapToFire,
    progressPercent,
    savingsRate,
    yearsToFire,
    projectedFireDate,
    alreadyFire,
  };
}
