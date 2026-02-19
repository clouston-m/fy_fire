// ─── User Inputs ──────────────────────────────────────────────────────────────

export interface FireInputs {
  /** Monthly spending in retirement (£) */
  monthlySpending: number;
  /** Target safe withdrawal rate (%, e.g. 4 means 4%) */
  withdrawalRate: number;
  /** Current invested net worth (£) */
  currentNetWorth: number;
  /** Monthly gross income (£) — used for savings rate */
  monthlyIncome: number;
  /** Monthly contributions to investments (£) */
  monthlyContributions: number;
  /** Expected annual investment return (%, e.g. 6 means 6%) */
  expectedReturn: number;
}

// ─── Calculated Outputs ───────────────────────────────────────────────────────

export interface FireResults {
  /** Annual spending needed in retirement (£) */
  annualExpenses: number;
  /** The FIRE number — total portfolio needed (£) */
  fireNumber: number;
  /** Gap remaining to reach FIRE number (£). 0 if already FIRE. */
  gapToFire: number;
  /** Current progress as a percentage of the FIRE number (0–100) */
  progressPercent: number;
  /** Savings rate as a percentage of gross monthly income */
  savingsRate: number;
  /** Estimated years until FIRE number is reached */
  yearsToFire: number | null;
  /** Projected calendar date of reaching FIRE (null if already FIRE or unreachable) */
  projectedFireDate: Date | null;
  /** True if current net worth already meets or exceeds the FIRE number */
  alreadyFire: boolean;
}

// ─── Calculation Params ───────────────────────────────────────────────────────

export interface CalculationParams {
  /** Current portfolio value (£) */
  currentNetWorth: number;
  /** Monthly contribution (£) */
  monthlyContributions: number;
  /** Annual return rate as a decimal (e.g. 0.06 for 6%) */
  annualReturnRate: number;
  /** Target portfolio value (£) */
  fireNumber: number;
}

// ─── Default Input Values ─────────────────────────────────────────────────────

export const DEFAULT_INPUTS: FireInputs = {
  monthlySpending: 2000,
  withdrawalRate: 4,
  currentNetWorth: 50000,
  monthlyIncome: 4000,
  monthlyContributions: 1000,
  expectedReturn: 6,
};

// ─── Input Constraints ────────────────────────────────────────────────────────

export const INPUT_CONSTRAINTS = {
  withdrawalRate: { min: 3, max: 5, step: 0.1 },
  expectedReturn: { min: 4, max: 8, step: 0.5 },
} as const;
