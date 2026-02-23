'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { FireResults } from '@/components/calculator/FireResults';
import { calculateFire, formatCurrency } from '@/lib/calculations';
import { loadInputs, saveInputs } from '@/lib/storage';
import type { FireInputs } from '@/lib/types';
import { DEFAULT_INPUTS, INPUT_CONSTRAINTS, PENSION_ACCESS_AGE } from '@/lib/types';

// ─── Step Types ───────────────────────────────────────────────────────────────

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
};

type CurrencyStep = {
  type: 'currency';
  field: keyof FireInputs;
  title: string;
  subtitle: string;
  hint?: string;
  allowZero?: boolean;
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
};

type WizardStep = AgeStep | CurrencyStep | CurrencyBreakdownStep | SliderStep;

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS: WizardStep[] = [
  {
    type: 'age',
    field: 'currentAge',
    title: 'How old are you?',
    subtitle: 'Your current age in years.',
    min: 18,
    max: 80,
  },
  {
    type: 'age',
    field: 'targetRetirementAge',
    title: 'When do you want\nto retire?',
    subtitle: 'Your target retirement age.',
    hint: `Pension access age is currently ${PENSION_ACCESS_AGE}. Retiring earlier requires an ISA bridge.`,
    min: 18,
    max: 85,
    validateGt: 'currentAge',
    validateMessage: 'Must be greater than your current age',
  },
  {
    type: 'currency',
    field: 'monthlySpending',
    title: 'How much will you\nspend each month\nin retirement?',
    subtitle: 'Your expected monthly living costs once you stop working.',
    hint: 'Include rent/mortgage, food, travel, leisure',
  },
  {
    type: 'currency-breakdown',
    title: "What's your current\nnet worth?",
    subtitle: 'Total invested assets across all wrappers.',
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
  },
  {
    type: 'currency',
    field: 'monthlyIncome',
    title: "What's your gross\nmonthly income?",
    subtitle: 'Your total monthly income before tax and deductions.',
  },
  {
    type: 'currency-breakdown',
    title: 'How much do you\ninvest each month?',
    subtitle: 'Monthly contributions across investment accounts.',
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
  },
  {
    type: 'slider',
    field: 'withdrawalRate',
    title: 'Safe withdrawal\nrate',
    subtitle: "The percentage you'll draw from your portfolio each year.",
    min: INPUT_CONSTRAINTS.withdrawalRate.min,
    max: INPUT_CONSTRAINTS.withdrawalRate.max,
    sliderStep: INPUT_CONSTRAINTS.withdrawalRate.step,
    unit: '%',
    description:
      'The 4% rule is the classic FIRE benchmark — research suggests a 4% annual withdrawal has historically lasted 30+ years. Lower rates are more conservative.',
  },
  {
    type: 'slider',
    field: 'expectedReturn',
    title: 'Expected annual\nreturn',
    subtitle: 'Your estimated average annual portfolio growth.',
    min: INPUT_CONSTRAINTS.expectedReturn.min,
    max: INPUT_CONSTRAINTS.expectedReturn.max,
    sliderStep: INPUT_CONSTRAINTS.expectedReturn.step,
    unit: '%',
    description:
      'Global index funds have historically returned 6–8% annually before inflation. A conservative estimate of 5–6% is common for long-term planning.',
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
  const [inputs, setInputs] = useState<FireInputs>(DEFAULT_INPUTS);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

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

  // ── Results screen (stepIndex === TOTAL_STEPS) ─────────────────────────────

  if (stepIndex === TOTAL_STEPS) {
    const results = calculateFire(inputs);
    return (
      <div>
        <div className="flex items-center px-4 min-h-[44px] pt-2">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div key={stepIndex} className={`px-4 pb-10 ${animClass}`}>
          <h2 className="text-[1.75rem] font-bold mb-6">Your FIRE Plan</h2>
          <FireResults results={results} inputs={inputs} />
          <div className="mt-8 flex justify-center">
            <Button variant="ghost" onClick={goBack} className="text-muted-foreground">
              ← Edit answers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Input step screen ─────────────────────────────────────────────────────

  const step = STEPS[stepIndex];

  // Determine whether Continue is enabled
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

  return (
    <div>
      {/* Progress bar */}
      <div className="h-1 bg-muted w-full">
        <div
          className="h-full bg-primary transition-[width] duration-500"
          style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Nav bar */}
      <div className="flex items-center justify-between px-4 min-h-[44px]">
        {stepIndex > 0 ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}
        <span className="text-sm text-muted-foreground">
          {stepIndex + 1} / {TOTAL_STEPS}
        </span>
      </div>

      {/* Animated content */}
      <div key={stepIndex} className={`px-4 pt-10 pb-8 ${animClass}`}>
        <h2 className="text-[1.75rem] font-bold whitespace-pre-line mb-2">
          {'title' in step ? step.title : ''}
        </h2>
        <p className="text-muted-foreground mb-8">{'subtitle' in step ? step.subtitle : ''}</p>

        {step.type === 'age' && (
          <AgeStepInput
            step={step}
            value={inputs[step.field] as number}
            onChange={(v) => updateField(step.field, v)}
            onEnter={canContinue ? goNext : undefined}
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

        <Button
          className="w-full h-14 mt-10 text-base"
          onClick={goNext}
          disabled={!canContinue}
        >
          {stepIndex === TOTAL_STEPS - 1 ? 'See my FIRE number →' : 'Continue'}
        </Button>

        {/* Validation message for age steps */}
        {step.type === 'age' && !canContinue && step.validateMessage &&
          (inputs[step.field] as number) > 0 && (
          <p className="mt-3 text-center text-sm text-destructive">{step.validateMessage}</p>
        )}
      </div>
    </div>
  );
}

// ─── Age Step Input ───────────────────────────────────────────────────────────

interface AgeStepInputProps {
  step: AgeStep;
  value: number;
  onChange: (v: number) => void;
  onEnter?: () => void;
}

function AgeStepInput({ step, value, onChange, onEnter }: AgeStepInputProps) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <div>
      {step.hint && (
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground mb-6 leading-relaxed">
          {step.hint}
        </div>
      )}
      <div className="flex items-end gap-3">
        <input
          type="number"
          inputMode="numeric"
          min={step.min}
          max={step.max}
          step="1"
          placeholder="—"
          className="w-full h-14 px-4 text-2xl border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 tabular-nums"
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
        <span className="text-2xl text-muted-foreground mb-3 shrink-0">years old</span>
      </div>
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
    <div>
      {step.hint && <p className="text-sm text-muted-foreground mb-4">{step.hint}</p>}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground select-none">
          £
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="100"
          placeholder="0"
          className="w-full h-14 pl-10 pr-4 text-2xl border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
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
    </div>
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
    <div className="space-y-4">
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
        <span className="text-sm text-muted-foreground">{step.totalLabel}</span>
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
    <div>
      <label className="block text-sm font-medium mb-1">{fieldDef.label}</label>
      {fieldDef.hint && (
        <p className="text-xs text-muted-foreground mb-1.5">{fieldDef.hint}</p>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground select-none">
          £
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="100"
          placeholder="0"
          className="w-full h-12 pl-9 pr-4 text-xl border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
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
    </div>
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
        <span className="text-3xl font-bold text-muted-foreground">{step.unit}</span>
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
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {step.min}
          {step.unit}
        </span>
        <span>
          {step.max}
          {step.unit}
        </span>
      </div>
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </div>
    </div>
  );
}
