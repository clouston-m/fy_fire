'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LandPlot, Zap, TrendingUp, Pencil, X } from 'lucide-react';
import { FireResults } from '@/components/calculator/FireResults';
import { calculateFire } from '@/lib/calculations';
import { isPlanComplete, loadInputs } from '@/lib/storage';
import type { FireInputs, FireResults as FireResultsType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type Status = 'completed' | 'active' | 'locked';

interface Phase {
  id: string;
  label: string;
  tagline: string;
  status: Status;
  icon: React.ElementType;
}

function buildPhases(planDone: boolean): Phase[] {
  return [
    {
      id: 'plan',
      label: 'Plan',
      tagline: 'Set your goals for retirement',
      status: planDone ? 'completed' : 'active',
      icon: LandPlot,
    },
    {
      id: 'optimise',
      label: 'Optimise',
      tagline: 'Streamline income and expenses',
      status: planDone ? 'active' : 'locked',
      icon: Zap,
    },
    {
      id: 'track',
      label: 'Track',
      tagline: 'Analyse and compare your progress',
      status: 'locked',
      icon: TrendingUp,
    },
  ];
}

export function PathwayScreen() {
  const [planDone, setPlanDone] = useState(false);
  const [fireInputs, setFireInputs] = useState<FireInputs | null>(null);
  const [fireResults, setFireResults] = useState<FireResultsType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
  const completedCount = phases.filter((p) => p.status === 'completed').length;

  return (
    <>
      <div className="min-h-dvh bg-white flex flex-col">
        {/* Header */}
        <div className="pt-8 pb-14 text-center">
          <h1 className="text-2xl font-semibold tracking-[-1px] text-black leading-[1.2]">
            FIRE pathway
          </h1>
          <p className="text-xs text-black mt-1">{completedCount}/3 complete</p>
        </div>

        {/* Phase list */}
        <div className="flex-1 px-8">
          <div className="flex flex-col gap-5">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isCompleted = phase.status === 'completed';
              const isActive = phase.status === 'active';

              return (
                <div
                  key={phase.id}
                  className={[
                    'flex items-center gap-4 p-4 rounded-lg h-[76px]',
                    isActive
                      ? 'bg-white border border-neutral-200'
                      : 'bg-neutral-100',
                  ].join(' ')}
                >
                  {/* Icon badge */}
                  <div className="shrink-0 w-8 h-8 rounded-[4px] bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-950" strokeWidth={1.5} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-sm font-medium leading-5 text-neutral-950">
                      {phase.label}
                    </p>
                    <p className="text-sm font-medium leading-5 text-neutral-500">
                      {phase.tagline}
                    </p>
                  </div>

                  {/* Edit button — completed phases only */}
                  {isCompleted && (
                    <Button variant="outline" size="icon" className="shrink-0 rounded-full" asChild>
                      <Link href="/calculator">
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="px-8 pb-8 pt-6 flex flex-col gap-3">
          {planDone ? (
            <Button disabled className="w-full">
              Next
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link href="/calculator">Next</Link>
            </Button>
          )}

          {planDone && fireResults && (
            <Button variant="outline" className="w-full" onClick={() => setDrawerOpen(true)}>
              FIRE calculation
            </Button>
          )}
        </div>
      </div>

      {/* FIRE results drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} shouldScaleBackground={false}>
        <DrawerContent style={{ maxHeight: '88dvh' }}>
          <DrawerHeader className="flex flex-row items-center justify-between border-b border-neutral-100 px-6 py-3">
            <DrawerTitle>Your FIRE calculation</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
            {fireResults && fireInputs && (
              <FireResults results={fireResults} inputs={fireInputs} />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
