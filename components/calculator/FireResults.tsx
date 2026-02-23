'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  formatCurrency,
  formatPercent,
  formatMonthYear,
} from '@/lib/calculations';
import type { FireResults as FireResultsType, FireInputs } from '@/lib/types';
import { PENSION_ACCESS_AGE } from '@/lib/types';
import { TrendingUp, Target, Calendar, Zap, PiggyBank, ShieldCheck, TriangleAlert } from 'lucide-react';

interface FireResultsProps {
  results: FireResultsType;
  inputs: FireInputs;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, sub, highlight }: StatCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg p-4 ${
        highlight ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/50'
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold tabular-nums ${highlight ? 'text-primary' : ''}`}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function FireResults({ results, inputs }: FireResultsProps) {
  const {
    annualExpenses,
    fireNumber,
    totalNetWorth,
    totalMonthlyContributions,
    gapToFire,
    progressPercent,
    savingsRate,
    yearsToFire,
    projectedFireDate,
    alreadyFire,
    yearsToRetirement,
    requiresBridge,
    isaGapYears,
    isaBridgeNeeded,
    projectedISAAtRetirement,
    projectedGIAAtRetirement,
    projectedAccessibleAtRetirement,
    isBridgeViable,
    bridgeShortfall,
  } = results;

  const { currentAge, targetRetirementAge, monthlyIncome } = inputs;

  const yearsLabel =
    yearsToFire === null
      ? 'Never (increase contributions)'
      : yearsToFire === 0 || alreadyFire
      ? 'Now!'
      : `${yearsToFire.toFixed(1)} years`;

  const fireDateLabel =
    alreadyFire
      ? 'You are already FI!'
      : projectedFireDate
      ? formatMonthYear(projectedFireDate)
      : '—';

  // Projected age at FIRE
  const projectedFireAge =
    yearsToFire !== null && !alreadyFire
      ? Math.round(currentAge + yearsToFire)
      : null;

  const yearsBehindTarget =
    projectedFireAge !== null
      ? projectedFireAge - targetRetirementAge
      : null;

  return (
    <div className="space-y-4">
      {/* ── Hero: FIRE Number + Progress ── */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Your FIRE Dashboard</CardTitle>
            {alreadyFire && (
              <Badge className="bg-primary text-primary-foreground">
                <Zap className="mr-1 h-3 w-3" />
                FI Achieved!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* FIRE Number */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Your FIRE Number</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums text-primary">
              {formatCurrency(fireNumber)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(annualExpenses)}/yr ÷ {inputs.withdrawalRate}% withdrawal rate
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold tabular-nums">
                {formatPercent(progressPercent)}
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{formatCurrency(totalNetWorth)}</span>
              <span>{formatCurrency(fireNumber)}</span>
            </div>
          </div>

          {/* Target vs Reality */}
          {!alreadyFire && (
            <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your target</span>
                <span className="font-medium tabular-nums">
                  Retire at {targetRetirementAge} (in {Math.max(0, yearsToRetirement).toFixed(0)} yrs)
                </span>
              </div>
              {projectedFireAge !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FIRE number reached</span>
                  <span className="font-medium tabular-nums">
                    Age {projectedFireAge} ({yearsLabel})
                  </span>
                </div>
              )}
              {yearsBehindTarget !== null && yearsBehindTarget > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                  <span>Behind target</span>
                  <span>{yearsBehindTarget} yr{yearsBehindTarget !== 1 ? 's' : ''}</span>
                </div>
              )}
              {yearsBehindTarget !== null && yearsBehindTarget <= 0 && projectedFireAge !== null && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Ahead of target</span>
                  <span>{Math.abs(yearsBehindTarget)} yr{Math.abs(yearsBehindTarget) !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Projected Date */}
          {!alreadyFire && projectedFireDate && (
            <div className="rounded-lg bg-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">Projected FIRE date</p>
              <p className="mt-0.5 text-2xl font-bold text-primary">{fireDateLabel}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{yearsLabel}</p>
            </div>
          )}

          {alreadyFire && (
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">🎉 You are Financially Independent!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your portfolio can sustain your lifestyle indefinitely at a{' '}
                {inputs.withdrawalRate}% withdrawal rate.
              </p>
            </div>
          )}

          {yearsToFire === null && !alreadyFire && (
            <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
              At your current contributions and return rate, the FIRE number will not be reached
              within 100 years. Try increasing your monthly contributions or return rate.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ISA Bridge ── */}
      {requiresBridge ? (
        <Card className={isBridgeViable ? '' : 'border-amber-300 dark:border-amber-700'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isBridgeViable ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <TriangleAlert className="h-4 w-4 text-amber-500" />
              )}
              ISA Bridge (Age {targetRetirementAge} → {PENSION_ACCESS_AGE})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bridge period</span>
              <span className="font-medium tabular-nums">{isaGapYears} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bridge needed</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(isaBridgeNeeded!)}
                <span className="text-xs text-muted-foreground ml-1">
                  ({isaGapYears} yrs × {formatCurrency(annualExpenses)}/yr)
                </span>
              </span>
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Accessible at retirement (projected)
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ISA</span>
                <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(projectedISAAtRetirement!)}
                  <span className="text-xs text-muted-foreground ml-1">(tax-free)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GIA</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(projectedGIAAtRetirement!)}
                  <span className="text-xs text-muted-foreground ml-1">(subject to CGT)</span>
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-border">
                <span>Total accessible</span>
                <span className="tabular-nums">{formatCurrency(projectedAccessibleAtRetirement!)}</span>
              </div>
            </div>

            {isBridgeViable ? (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Bridge covered — your ISA + GIA will fund the gap to pension access
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                  <TriangleAlert className="h-4 w-4 shrink-0" />
                  Bridge shortfall: {formatCurrency(bridgeShortfall!)}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Your projected ISA + GIA won&apos;t cover the gap between retirement ({targetRetirementAge}) and pension access ({PENSION_ACCESS_AGE}).
                  Use the Optimise phase to rebalance your ISA/pension split.
                </p>
              </div>
            )}

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1 leading-relaxed">
              <p className="font-medium">Phase 1 (age {targetRetirementAge}–{PENSION_ACCESS_AGE}): Draw from ISA and GIA</p>
              <p className="font-medium">Phase 2 (age {PENSION_ACCESS_AGE}+): Access pension + remaining accessible funds</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm">No Bridge Needed</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You can access your pension immediately at retirement (age{' '}
                  {targetRetirementAge} ≥ {PENSION_ACCESS_AGE}).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Stat Grid ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Gap to close"
              value={alreadyFire ? '£0' : formatCurrency(gapToFire)}
              sub={alreadyFire ? 'Already there!' : 'remaining to reach FIRE'}
            />
            <StatCard
              icon={<Calendar className="h-5 w-5" />}
              label="Years to FIRE"
              value={yearsLabel}
              sub={projectedFireDate && !alreadyFire ? fireDateLabel : undefined}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Expected annual return"
              value={formatPercent(inputs.expectedReturn)}
              sub="on invested assets"
            />
            <StatCard
              icon={<PiggyBank className="h-5 w-5" />}
              label="Savings rate"
              value={formatPercent(savingsRate)}
              sub={`${formatCurrency(totalMonthlyContributions)}/mo of ${formatCurrency(monthlyIncome)}/mo income`}
              highlight={savingsRate >= 40}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Calculation Breakdown ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly spending</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(inputs.monthlySpending)}/mo
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Annual expenses</span>
            <span className="font-medium tabular-nums">{formatCurrency(annualExpenses)}/yr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Multiplier (100 ÷ {inputs.withdrawalRate}%)</span>
            <span className="font-medium tabular-nums">
              ×{(100 / inputs.withdrawalRate).toFixed(1)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>FIRE Number</span>
            <span className="tabular-nums text-primary">{formatCurrency(fireNumber)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
