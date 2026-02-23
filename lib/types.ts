// ─── Constants ────────────────────────────────────────────────────────────────

export const PENSION_ACCESS_AGE = 57;

// ─── User Inputs ──────────────────────────────────────────────────────────────

export interface FireInputs {
  /** Current age (years) */
  currentAge: number;
  /** Target retirement age (years) */
  targetRetirementAge: number;
  /** Monthly spending in retirement (£) */
  monthlySpending: number;
  /** Target safe withdrawal rate (%, e.g. 4 means 4%) */
  withdrawalRate: number;
  /** ISA (Stocks & Shares / Cash ISA) balance (£) */
  isaBalance: number;
  /** Pension / SIPP balance (£) */
  pensionBalance: number;
  /** General Investment Account balance (£) */
  giaBalance: number;
  /** Monthly gross income (£) — used for savings rate */
  monthlyIncome: number;
  /** Monthly ISA contributions (£) */
  monthlyISAContributions: number;
  /** Monthly pension contributions (£, include employer) */
  monthlyPensionContributions: number;
  /** Expected annual investment return (%, e.g. 6 means 6%) */
  expectedReturn: number;
}

// ─── Calculated Outputs ───────────────────────────────────────────────────────

export interface FireResults {
  /** Annual spending needed in retirement (£) */
  annualExpenses: number;
  /** The FIRE number — total portfolio needed (£) */
  fireNumber: number;
  /** Total current net worth across all wrappers (£) */
  totalNetWorth: number;
  /** Total monthly contributions across ISA + pension (£) */
  totalMonthlyContributions: number;
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

  // ── Age / retirement horizon ──
  /** Years from now until target retirement age */
  yearsToRetirement: number;
  /** 57 - targetRetirementAge (negative means retiring after pension access) */
  yearsUntilPensionAccess: number;
  /** True if targetRetirementAge < PENSION_ACCESS_AGE (57) */
  requiresBridge: boolean;

  // ── Bridge fields (only populated when requiresBridge === true) ──
  /** Years between target retirement and pension access age */
  isaGapYears?: number;
  /** Total ISA-accessible funds needed to bridge to pension access (£) */
  isaBridgeNeeded?: number;
  /** Projected ISA balance at retirement date (£) */
  projectedISAAtRetirement?: number;
  /** Projected GIA balance at retirement date (£) */
  projectedGIAAtRetirement?: number;
  /** Projected total accessible (ISA + GIA) at retirement (£) */
  projectedAccessibleAtRetirement?: number;
  /** True if projectedAccessibleAtRetirement >= isaBridgeNeeded */
  isBridgeViable?: boolean;
  /** Shortfall amount (0 if viable) */
  bridgeShortfall?: number;
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
  currentAge: 35,
  targetRetirementAge: 55,
  monthlySpending: 2000,
  withdrawalRate: 4,
  isaBalance: 0,
  pensionBalance: 50000,
  giaBalance: 0,
  monthlyIncome: 4000,
  monthlyISAContributions: 500,
  monthlyPensionContributions: 500,
  expectedReturn: 6,
};

// ─── Input Constraints ────────────────────────────────────────────────────────

export const INPUT_CONSTRAINTS = {
  withdrawalRate: { min: 3, max: 5, step: 0.1 },
  expectedReturn: { min: 4, max: 8, step: 0.5 },
} as const;
