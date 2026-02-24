'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Lock, ChevronRight, X, BarChart2 } from 'lucide-react';
import { FireResults } from '@/components/calculator/FireResults';
import { calculateFire } from '@/lib/calculations';
import { isPlanComplete, loadInputs } from '@/lib/storage';
import type { FireInputs } from '@/lib/types';
import type { FireResults as FireResultsType } from '@/lib/types';

// ─── Phase config ──────────────────────────────────────────────────────────────

type Status = 'completed' | 'active' | 'locked';

interface Phase {
  id: string;
  label: string;
  tagline: string;
  status: Status;
  href?: string;
  cta?: string;
  ctaDisabled?: boolean;
}

function buildPhases(planDone: boolean): Phase[] {
  return [
    {
      id: 'plan',
      label: 'Plan',
      tagline: 'Calculate your FIRE number & retirement date',
      status: planDone ? 'completed' : 'active',
      href: planDone ? undefined : '/calculator',
      cta: 'Start',
    },
    {
      id: 'optimise',
      label: 'Optimise',
      tagline: 'Fine-tune your strategy to reach FIRE faster',
      status: planDone ? 'active' : 'locked',
      cta: 'Coming soon',
      ctaDisabled: true,
    },
    {
      id: 'track',
      label: 'Track',
      tagline: 'Monitor your progress toward financial independence',
      status: 'locked',
    },
  ];
}

// ─── SVG / layout constants ────────────────────────────────────────────────────

const W = 400;
const H = 700;
const NODE_R = 36;

// Node centres in SVG space — zigzag right → left → right
const CENTERS = [
  { x: 268, y: 100 },
  { x: 132, y: 380 },
  { x: 268, y: 578 },
];

function sCurve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mid = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PathwayScreen() {
  const [planDone, setPlanDone] = useState(false);
  const [fireInputs, setFireInputs] = useState<FireInputs | null>(null);
  const [fireResults, setFireResults] = useState<FireResultsType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const done = isPlanComplete();
    setPlanDone(done);
    if (done) {
      const inputs = loadInputs();
      setFireInputs(inputs);
      setFireResults(calculateFire(inputs));
    }
  }, []);

  const phases = buildPhases(planDone);

  return (
    <>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-14 pb-4">
          <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-1.5">
            fy_fire
          </p>
          <h1 className="text-white text-2xl font-bold tracking-tight">Your FIRE journey</h1>
          <p className="text-slate-500 text-sm mt-1">Three phases to financial independence.</p>
        </div>

        {/* Pathway canvas */}
        <div className="flex-1 flex justify-center px-6 py-4">
          <div
            className="relative w-full"
            style={{ maxWidth: `${W}px`, paddingBottom: `${(H / W) * 100}%` }}
          >
            <div className="absolute inset-0">
              {/* SVG connecting paths */}
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={sCurve(CENTERS[0], CENTERS[1])}
                  fill="none"
                  stroke={planDone ? '#10b981' : '#1e293b'}
                  strokeWidth="4"
                  strokeDasharray={planDone ? 'none' : '10 8'}
                  strokeLinecap="round"
                />
                <path
                  d={sCurve(CENTERS[1], CENTERS[2])}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="4"
                  strokeDasharray="10 8"
                  strokeLinecap="round"
                />
              </svg>

              {/* Phase nodes */}
              {phases.map((phase, i) => {
                const { x, y } = CENTERS[i];
                const isActive = phase.status === 'active';
                const isCompleted = phase.status === 'completed';
                const isLocked = phase.status === 'locked';

                return (
                  <div
                    key={phase.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${(x / W) * 100}%`,
                      top: `${(y / H) * 100}%`,
                      transform: 'translateX(-50%)',
                      marginTop: `-${NODE_R}px`,
                    }}
                  >
                    {/* Pulse rings — active only */}
                    {isActive && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[72px] h-[72px] pointer-events-none">
                        <span className="absolute inset-0 rounded-full bg-white/20 pathway-pulse" />
                        <span className="absolute inset-[-10px] rounded-full bg-white/10 pathway-pulse-delay" />
                      </div>
                    )}

                    {/* Circle */}
                    <div
                      className={[
                        'relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center border-2',
                        isCompleted && 'bg-emerald-500 border-emerald-400',
                        isActive && 'bg-white border-white',
                        isLocked && 'bg-slate-800 border-slate-700',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {isCompleted && <Check className="w-7 h-7 text-white" strokeWidth={3} />}
                      {isActive && (
                        <ChevronRight className="w-7 h-7 text-slate-900" strokeWidth={2.5} />
                      )}
                      {isLocked && <Lock className="w-6 h-6 text-slate-600" />}
                    </div>

                    {/* Label */}
                    <p
                      className={`mt-3 font-semibold text-base ${
                        isLocked ? 'text-slate-600' : 'text-white'
                      }`}
                    >
                      {phase.label}
                    </p>

                    {/* Active: tagline + CTA */}
                    {isActive && (
                      <>
                        <p className="mt-1 text-slate-400 text-xs text-center leading-snug max-w-[130px]">
                          {phase.tagline}
                        </p>
                        {phase.ctaDisabled ? (
                          <button
                            disabled
                            className="mt-4 px-6 py-2.5 bg-slate-800 text-slate-500 text-sm font-bold rounded-xl cursor-not-allowed"
                          >
                            {phase.cta}
                          </button>
                        ) : phase.href ? (
                          <Link href={phase.href} className="mt-4">
                            <span className="inline-block px-6 py-2.5 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                              {phase.cta} →
                            </span>
                          </Link>
                        ) : null}
                      </>
                    )}

                    {/* Completed: edit link */}
                    {isCompleted && (
                      <Link
                        href="/calculator"
                        className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Edit answers
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FIRE calculation button — shown only when plan is done */}
        {planDone && fireResults && (
          <div className="px-6 pb-12 pt-2">
            <button
              onClick={() => setSheetOpen(true)}
              className="w-full py-4 rounded-2xl border border-slate-700 text-white text-base font-semibold flex items-center justify-center gap-2.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors"
            >
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              FIRE calculation
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom sheet ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSheetOpen(false)}
      />

      {/* Sheet panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '88dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Your FIRE calculation</h2>
          <button
            onClick={() => setSheetOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Scrollable results */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
          {fireResults && fireInputs && (
            <FireResults results={fireResults} inputs={fireInputs} />
          )}
        </div>
      </div>
    </>
  );
}
