'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FireResults } from '@/components/calculator/FireResults';
import { calculateFire } from '@/lib/calculations';
import { loadInputs, saveInputs, clearInputs } from '@/lib/storage';
import type { FireInputs, FireResults as FireResultsType } from '@/lib/types';
import { DEFAULT_INPUTS, INPUT_CONSTRAINTS } from '@/lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePositiveNumber(value: string): number {
  const parsed = parseFloat(value.replace(/,/g, ''));
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

interface CurrencyInputProps {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

function CurrencyInput({ id, label, hint, value, onChange, min = 0 }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : String(value));

  // Sync external value changes (e.g. reset)
  useEffect(() => {
    setDisplayValue(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          £
        </span>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step="100"
          className="pl-7"
          value={displayValue}
          onChange={(e) => {
            setDisplayValue(e.target.value);
            onChange(parsePositiveNumber(e.target.value));
          }}
          onBlur={() => {
            // Re-sync display on blur to clean up empty state
            setDisplayValue(value === 0 ? '' : String(value));
          }}
        />
      </div>
    </div>
  );
}

interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function SliderInput({ id, label, value, min, max, step, unit, onChange }: SliderInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-base">
          {label}
        </Label>
        <span className="text-sm font-semibold tabular-nums">
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="py-1"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateInputs(inputs: FireInputs): string[] {
  const errors: string[] = [];
  if (inputs.monthlySpending <= 0) errors.push('Monthly spending must be greater than £0.');
  if (inputs.monthlyIncome <= 0) errors.push('Monthly income must be greater than £0.');
  if (inputs.monthlyContributions > inputs.monthlyIncome)
    errors.push('Monthly contributions cannot exceed monthly income.');
  return errors;
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export function FireCalculatorForm() {
  const [inputs, setInputs] = useState<FireInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<FireResultsType | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load persisted inputs once on mount
  useEffect(() => {
    const saved = loadInputs();
    setInputs(saved);
    setHasLoaded(true);
  }, []);

  // Auto-calculate and persist whenever inputs change (after initial load)
  useEffect(() => {
    if (!hasLoaded) return;

    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsCalculating(true);
      // rAF keeps UI responsive for any future heavy calculations
      const id = requestAnimationFrame(() => {
        setResults(calculateFire(inputs));
        setIsCalculating(false);
      });
      return () => cancelAnimationFrame(id);
    } else {
      setResults(null);
    }

    saveInputs(inputs);
  }, [inputs, hasLoaded]);

  const updateField = useCallback(<K extends keyof FireInputs>(key: K, value: FireInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = () => {
    clearInputs();
    setInputs(DEFAULT_INPUTS);
  };

  return (
    <div className="space-y-6">
      {/* ── Input Form ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Numbers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Retirement spending */}
          <CurrencyInput
            id="monthlySpending"
            label="Monthly spending in retirement"
            hint="How much do you need to live on each month?"
            value={inputs.monthlySpending}
            onChange={(v) => updateField('monthlySpending', v)}
          />

          {/* Current situation */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Current Situation
            </h3>
            <CurrencyInput
              id="currentNetWorth"
              label="Current invested net worth"
              hint="Total value of investments, ISAs, pensions (all accounts)"
              value={inputs.currentNetWorth}
              onChange={(v) => updateField('currentNetWorth', v)}
            />
            <CurrencyInput
              id="monthlyIncome"
              label="Gross monthly income"
              hint="Your total monthly income before tax"
              value={inputs.monthlyIncome}
              onChange={(v) => updateField('monthlyIncome', v)}
            />
            <CurrencyInput
              id="monthlyContributions"
              label="Monthly contributions"
              hint="How much you invest each month across all accounts"
              value={inputs.monthlyContributions}
              onChange={(v) => updateField('monthlyContributions', v)}
            />
          </div>

          {/* Assumptions */}
          <Separator />
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Assumptions
            </h3>
            <SliderInput
              id="withdrawalRate"
              label="Withdrawal rate"
              value={inputs.withdrawalRate}
              min={INPUT_CONSTRAINTS.withdrawalRate.min}
              max={INPUT_CONSTRAINTS.withdrawalRate.max}
              step={INPUT_CONSTRAINTS.withdrawalRate.step}
              unit="%"
              onChange={(v) => updateField('withdrawalRate', v)}
            />
            <SliderInput
              id="expectedReturn"
              label="Expected annual return"
              value={inputs.expectedReturn}
              min={INPUT_CONSTRAINTS.expectedReturn.min}
              max={INPUT_CONSTRAINTS.expectedReturn.max}
              step={INPUT_CONSTRAINTS.expectedReturn.step}
              unit="%"
              onChange={(v) => updateField('expectedReturn', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Validation Errors ── */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <ul className="list-inside list-disc space-y-1">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Results ── */}
      {results && !isCalculating && <FireResults results={results} inputs={inputs} />}

      {/* ── Reset ── */}
      <div className="flex justify-center pb-2">
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
