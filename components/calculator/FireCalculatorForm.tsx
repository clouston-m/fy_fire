'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CircleHelp, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldDescription } from '@/components/ui/field';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { formatCurrency } from '@/lib/calculations';
import { loadInputs, saveInputs, markPlanComplete } from '@/lib/storage';
import type { FireInputs } from '@/lib/types';
import { DEFAULT_INPUTS, INPUT_CONSTRAINTS, PENSION_ACCESS_AGE } from '@/lib/types';

// ─── Step Types ───────────────────────────────────────────────────────────────

type StepInfo = {
  title: string;
  paragraphs: string[];
};

type AgeStep = {
  type: 'age';
  field: keyof FireInputs;
  title: string;
  subtitle: string;
  hint?: string;
  min: number;
  max: number;
  /** If set, field value must be strictly greater than inputs[validateGt] */
  validateGt?: keyof FireInputs;
  validateMessage?: string;
  info?: StepInfo;
};

type CurrencyStep = {
  type: 'currency';
  field: keyof FireInputs;
  title: string;
  subtitle: string;
  hint?: string;
  allowZero?: boolean;
  info?: StepInfo;
};

type CurrencyBreakdownField = {
  field: keyof FireInputs;
  label: string;
  hint?: string;
};

type CurrencyBreakdownStep = {
  type: 'currency-breakdown';
  title: string;
  subtitle: string;
  fields: CurrencyBreakdownField[];
  totalLabel: string;
  info?: StepInfo;
};

type SliderStep = {
  type: 'slider';
  field: keyof FireInputs;
  title: string;
  subtitle: string;
  min: number;
  max: number;
  sliderStep: number;
  unit: string;
  description: string;
  info?: StepInfo;
};

type WizardStep = AgeStep | CurrencyStep | CurrencyBreakdownStep | SliderStep;

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS: WizardStep[] = [
  {
    type: 'age',
    field: 'currentAge',
    title: 'How old are you?',
    subtitle: "We'll use this to figure out how long there is between now and your target retirement age",
    min: 18,
    max: 80,
    info: {
      title: 'Current age',
      paragraphs: [
        'Your current age tells us how long your money has to grow.',
        "If you're 30 and want to retire at 45, that's 15 years of compound growth. If you're 40 retiring at 45, that's only 5 years — same goal, totally different math.",
        "We also need to know if you're retiring before you can access your pension at 57, which affects how much you need in accessible savings.",
      ],
    },
  },
  {
    type: 'age',
    field: 'targetRetirementAge',
    title: 'When do you want to retire?',
    subtitle: 'Your target retirement age',
    hint: `Pension access age is currently ${PENSION_ACCESS_AGE}. Retiring earlier requires an ISA bridge.`,
    min: 18,
    max: 85,
    validateGt: 'currentAge',
    validateMessage: 'Must be greater than your current age',
    info: {
      title: 'Target retirement age',
      paragraphs: [
        "This is the age you plan to stop working — your finish line.",
        "In the UK, you can't access your pension until age 57. If you want to retire before that, you'll need enough in your ISA and other accessible accounts to cover the gap. We call this the ISA bridge.",
        "Retiring at 50 with a pension? You'll need 7 years of living costs in accessible savings before your pension kicks in. The earlier you want out, the more that bridge matters.",
      ],
    },
  },
  {
    type: 'currency',
    field: 'monthlySpending',
    title: 'How much will you spend each month in retirement?',
    subtitle: 'Your expected monthly living costs once you stop working',
    hint: 'Include rent/mortgage, food, travel, leisure',
    info: {
      title: 'Monthly spending',
      paragraphs: [
        "This is the single most important number in your FIRE plan — it drives everything else.",
        "Your FIRE number is just your annual spending multiplied by 25 (at a 4% withdrawal rate). Spend £2,000/month and you need £600,000. Spend £3,000/month and you need £900,000.",
        "Be honest and realistic. Include everything — housing, food, travel, subscriptions, and a buffer for the unexpected. Most people underestimate, especially in the active early years of retirement.",
      ],
    },
  },
  {
    type: 'currency-breakdown',
    title: "What's your current net worth?",
    subtitle: 'Total invested assets across all wrappers',
    fields: [
      {
        field: 'isaBalance',
        label: 'ISA balance',
        hint: 'Cash ISA, Stocks & Shares ISA',
      },
      {
        field: 'pensionBalance',
        label: 'Pension / SIPP balance',
        hint: 'Workplace pension, personal SIPP',
      },
      {
        field: 'giaBalance',
        label: 'General Investment Account',
        hint: 'Any other invested assets (optional)',
      },
    ],
    totalLabel: 'Total net worth',
    info: {
      title: 'Current net worth',
      paragraphs: [
        "This is where you're starting from — the total value of your invested assets across all accounts.",
        "We split it by wrapper because each one has different rules. ISAs are tax-free and accessible anytime. Pensions are locked until 57 but benefit from tax relief. GIAs are flexible but gains are subject to Capital Gains Tax.",
        "The split matters for your ISA bridge calculation. Even if your total looks healthy, we need to know how much of it you can actually reach before pension age.",
      ],
    },
  },
  {
    type: 'currency',
    field: 'monthlyIncome',
    title: "What's your gross monthly income?",
    subtitle: 'Your total monthly income before tax and deductions',
    info: {
      title: 'Gross monthly income',
      paragraphs: [
        "We use your gross income — before tax and National Insurance — to calculate your savings rate.",
        "Savings rate is one of the most powerful levers in FIRE. Earning £4,000/month and investing £1,000 is a 25% savings rate. Bump that to £1,500 and you're at 37.5% — a difference of years off your timeline.",
        "If your income varies month to month, use a typical monthly figure or your annual salary divided by 12.",
      ],
    },
  },
  {
    type: 'currency-breakdown',
    title: 'How much do you invest each month?',
    subtitle: 'Monthly contributions across investment accounts',
    fields: [
      {
        field: 'monthlyISAContributions',
        label: 'Monthly ISA contributions',
      },
      {
        field: 'monthlyPensionContributions',
        label: 'Monthly pension contributions',
        hint: 'Include employer contributions',
      },
    ],
    totalLabel: 'Total monthly contributions',
    info: {
      title: 'Monthly contributions',
      paragraphs: [
        "This is the engine of your FIRE plan — how much you're putting to work each month.",
        "Make sure to include your employer's pension contributions. If your employer matches 5% of your salary, that's free money already working for you. Leaving it out would understate your progress significantly.",
        "The ISA/pension split matters here too. Contributions going into a pension are locked until 57, while ISA contributions stay accessible. Getting the balance right is what the Optimise phase is all about.",
      ],
    },
  },
  {
    type: 'slider',
    field: 'withdrawalRate',
    title: 'Safe withdrawal rate',
    subtitle: "The percentage you'll draw from your portfolio each year",
    min: INPUT_CONSTRAINTS.withdrawalRate.min,
    max: INPUT_CONSTRAINTS.withdrawalRate.max,
    sliderStep: INPUT_CONSTRAINTS.withdrawalRate.step,
    unit: '%',
    description:
      'The 4% rule is the classic FIRE benchmark — research suggests a 4% annual withdrawal has historically lasted 30+ years. Lower rates are more conservative.',
    info: {
      title: 'Safe withdrawal rate',
      paragraphs: [
        "The safe withdrawal rate is the percentage of your portfolio you draw down each year in retirement without running out of money.",
        "The 4% rule comes from the Trinity Study — US research showing that a 4% annual withdrawal has survived virtually every 30-year market period in history. Most UK FIRE planners use 3.5–4% to account for a longer retirement and UK market differences.",
        "Retiring at 40 means your money needs to last 50+ years. In that case, 3.5% gives you more margin. If you plan to retire closer to 60, 4% or slightly above is more reasonable.",
      ],
    },
  },
  {
    type: 'slider',
    field: 'expectedReturn',
    title: 'Expected annual return',
    subtitle: 'Your estimated average annual portfolio growth',
    min: INPUT_CONSTRAINTS.expectedReturn.min,
    max: INPUT_CONSTRAINTS.expectedReturn.max,
    sliderStep: INPUT_CONSTRAINTS.expectedReturn.step,
    unit: '%',
    description:
      'Global index funds have historically returned 6–8% annually before inflation. A conservative estimate of 5–6% is common for long-term planning.',
    info: {
      title: 'Expected annual return',
      paragraphs: [
        "This is your assumed average annual growth rate across your entire portfolio.",
        "Global index funds tracking the MSCI World or S&P 500 have historically returned around 7–10% annually before inflation. After inflation (typically 2–3%), real returns tend to sit around 5–7%.",
        "We'd suggest using 6% as a balanced starting point — optimistic enough to be motivating, conservative enough to be realistic. If you're heavily weighted in bonds or cash, lean lower. If you're 100% in equities with a long horizon, 7% is defensible.",
      ],
    },
  },
];

const TOTAL_STEPS = STEPS.length; // 8

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCurrency(value: string): number {
  const parsed = parseFloat(value.replace(/,/g, ''));
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function calcBreakdownTotal(step: CurrencyBreakdownStep, inputs: FireInputs): number {
  return step.fields.reduce((sum, f) => sum + (inputs[f.field] as number), 0);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FireCalculatorForm() {
  const router = useRouter();
  const [inputs, setInputs] = useState<FireInputs>(DEFAULT_INPUTS);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [infoOpen, setInfoOpen] = useState(false);

  // Load persisted inputs on mount
  useEffect(() => {
    setInputs(loadInputs());
  }, []);

  const updateField = (key: keyof FireInputs, value: number) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      saveInputs(next);
      return next;
    });
  };

  const goNext = () => {
    if (stepIndex === TOTAL_STEPS - 1) {
      markPlanComplete();
      router.push('/pathway');
      return;
    }
    setDirection('forward');
    setStepIndex((i) => i + 1);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setDirection('back');
    setStepIndex((i) => i - 1);
    window.scrollTo(0, 0);
  };

  const animClass = direction === 'forward' ? 'wizard-enter-forward' : 'wizard-enter-back';

  const step = STEPS[stepIndex];

  // Determine whether Next is enabled
  let canContinue = true;
  if (step.type === 'age') {
    const value = inputs[step.field] as number;
    canContinue = value >= step.min && value <= step.max;
    if (canContinue && step.validateGt) {
      canContinue = value > (inputs[step.validateGt] as number);
    }
  } else if (step.type === 'currency') {
    canContinue = step.allowZero ? true : (inputs[step.field] as number) > 0;
  }
  // 'currency-breakdown' and 'slider' are always continuable

  const showValidation =
    step.type === 'age' &&
    !canContinue &&
    step.validateMessage &&
    (inputs[step.field] as number) > 0;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top section: progress bar + nav row */}
      <div className="px-8 pt-6 flex flex-col gap-4">
        <div className="h-2 bg-neutral-200 rounded-full w-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-500"
            style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          {stepIndex > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {stepIndex + 1}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* Animated content — vertically centred */}
      <div key={stepIndex} className={`flex-1 flex flex-col justify-center px-8 py-4 ${animClass}`}>
        <div className="flex flex-col gap-5">
        <h2 className="text-3xl font-semibold tracking-[-1px]">
          {'title' in step ? step.title : ''}
        </h2>
        <p>{'subtitle' in step ? step.subtitle : ''}</p>

        {step.type === 'age' && (
          <AgeStepInput
            step={step}
            value={inputs[step.field] as number}
            onChange={(v) => updateField(step.field, v)}
            onEnter={canContinue ? goNext : undefined}
            validationMessage={showValidation ? step.validateMessage : undefined}
          />
        )}

        {step.type === 'currency' && (
          <CurrencyStepInput
            step={step}
            value={inputs[step.field] as number}
            onChange={(v) => updateField(step.field, v)}
            onEnter={canContinue ? goNext : undefined}
          />
        )}

        {step.type === 'currency-breakdown' && (
          <CurrencyBreakdownStepInput
            step={step}
            inputs={inputs}
            onChange={(field, v) => updateField(field, v)}
            onEnter={goNext}
          />
        )}

        {step.type === 'slider' && (
          <SliderStepInput
            step={step}
            value={inputs[step.field] as number}
            onChange={(v) => updateField(step.field, v)}
          />
        )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-8 pb-8 pt-2 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-lg"
          disabled={!step.info}
          onClick={() => step.info && setInfoOpen(true)}
        >
          <CircleHelp className="h-4 w-4" />
        </Button>
        <Button className="flex-1 h-10" onClick={goNext} disabled={!canContinue}>
          {stepIndex === TOTAL_STEPS - 1 ? 'See my FIRE number' : 'Next'}
        </Button>
      </div>

      {/* Info drawer */}
      {step.info && (
        <Drawer open={infoOpen} onOpenChange={setInfoOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-semibold tracking-[-1px]">
                {step.info.title}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8 space-y-[14px]">
              {step.info.paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-5">{p}</p>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

// ─── Age Step Input ───────────────────────────────────────────────────────────

interface AgeStepInputProps {
  step: AgeStep;
  value: number;
  onChange: (v: number) => void;
  onEnter?: () => void;
  validationMessage?: string;
}

function AgeStepInput({ step, value, onChange, onEnter, validationMessage }: AgeStepInputProps) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <div className="space-y-5">
      <Input
        type="number"
        inputMode="numeric"
        min={step.min}
        max={step.max}
        step="1"
        placeholder="—"
        className="tabular-nums"
        value={displayValue}
        onChange={(e) => {
          setDisplayValue(e.target.value);
          const n = parseInt(e.target.value, 10);
          onChange(isNaN(n) || n < 0 ? 0 : n);
        }}
        onBlur={() => setDisplayValue(value === 0 ? '' : String(value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
      />
      {validationMessage && (
        <p className="text-sm text-destructive">{validationMessage}</p>
      )}
      {step.hint && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{step.hint}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ─── Currency Step Input ──────────────────────────────────────────────────────

interface CurrencyStepInputProps {
  step: CurrencyStep;
  value: number;
  onChange: (v: number) => void;
  onEnter?: () => void;
}

function CurrencyStepInput({ step, value, onChange, onEnter }: CurrencyStepInputProps) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <Field>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
          £
        </span>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="100"
          placeholder="0"
          className="pl-7"
          value={displayValue}
          onChange={(e) => {
            setDisplayValue(e.target.value);
            onChange(parseCurrency(e.target.value));
          }}
          onBlur={() => setDisplayValue(value === 0 ? '' : String(value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) onEnter();
          }}
        />
      </div>
      {step.hint && <FieldDescription>{step.hint}</FieldDescription>}
    </Field>
  );
}

// ─── Currency Breakdown Step Input ────────────────────────────────────────────

interface CurrencyBreakdownStepInputProps {
  step: CurrencyBreakdownStep;
  inputs: FireInputs;
  onChange: (field: keyof FireInputs, v: number) => void;
  onEnter: () => void;
}

function CurrencyBreakdownStepInput({
  step,
  inputs,
  onChange,
  onEnter,
}: CurrencyBreakdownStepInputProps) {
  const total = calcBreakdownTotal(step, inputs);

  return (
    <div className="space-y-5">
      {step.fields.map((fieldDef) => (
        <BreakdownFieldInput
          key={String(fieldDef.field)}
          fieldDef={fieldDef}
          value={inputs[fieldDef.field] as number}
          onChange={(v) => onChange(fieldDef.field, v)}
          onEnter={onEnter}
        />
      ))}

      {/* Running total */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 mt-2">
        <span className="text-sm">{step.totalLabel}</span>
        <span className="font-bold tabular-nums text-foreground">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

interface BreakdownFieldInputProps {
  fieldDef: CurrencyBreakdownField;
  value: number;
  onChange: (v: number) => void;
  onEnter: () => void;
}

function BreakdownFieldInput({ fieldDef, value, onChange, onEnter }: BreakdownFieldInputProps) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <Field>
      <p className="text-sm font-medium">{fieldDef.label}</p>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
          £
        </span>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="100"
          placeholder="0"
          className="pl-7"
          value={displayValue}
          onChange={(e) => {
            setDisplayValue(e.target.value);
            onChange(parseCurrency(e.target.value));
          }}
          onBlur={() => setDisplayValue(value === 0 ? '' : String(value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter();
          }}
        />
      </div>
      {fieldDef.hint && <FieldDescription>{fieldDef.hint}</FieldDescription>}
    </Field>
  );
}

// ─── Slider Step Input ────────────────────────────────────────────────────────

interface SliderStepInputProps {
  step: SliderStep;
  value: number;
  onChange: (v: number) => void;
}

function SliderStepInput({ step, value, onChange }: SliderStepInputProps) {
  const decimals = step.sliderStep < 1 ? 1 : 0;
  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="text-7xl font-bold tabular-nums">{value.toFixed(decimals)}</span>
        <span className="text-3xl font-bold">{step.unit}</span>
      </div>
      <Slider
        min={step.min}
        max={step.max}
        step={step.sliderStep}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="py-1"
        aria-label={step.title}
      />
      <div className="flex justify-between text-sm">
        <span>{step.min}{step.unit}</span>
        <span>{step.max}{step.unit}</span>
      </div>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{step.description}</AlertDescription>
      </Alert>
    </div>
  );
}
