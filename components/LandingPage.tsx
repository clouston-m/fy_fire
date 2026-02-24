'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop',
    headline: 'Know your FIRE number',
    subline: 'Find out exactly how much you need invested to live life on your terms — forever.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80&auto=format&fit=crop',
    headline: 'See your retirement date',
    subline: 'Project precisely when you\'ll reach financial independence, month by month.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1920&q=80&auto=format&fit=crop',
    headline: 'Built for UK investors',
    subline: 'Plan your ISA bridge and navigate pension access rules to retire before 57.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1920&q=80&auto=format&fit=crop',
    headline: 'Optimise your savings rate',
    subline: 'See how saving more today dramatically accelerates your path to freedom.',
  },
];

const SLIDE_DURATION_MS = 5000;

export function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % slides.length);
        setTextVisible(true);
      }, 350);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    if (index === current) return;
    setTextVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setTextVisible(true);
    }, 300);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Background slides (stacked, cross-fade via opacity) ── */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${slide.image})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* ── Gradient overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/75" />

      {/* ── Content ── */}
      <div className="relative h-full flex flex-col px-6 pt-14 pb-12 max-w-2xl mx-auto">
        {/* Brand */}
        <div className="text-white font-bold text-2xl tracking-tight select-none">
          fy_fire
        </div>

        {/* Headline + subline */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="transition-opacity duration-300"
            style={{ opacity: textVisible ? 1 : 0 }}
          >
            <h1 className="text-white text-4xl sm:text-5xl font-bold leading-tight mb-4">
              {slides[current].headline}
            </h1>
            <p className="text-white/80 text-lg sm:text-xl max-w-sm leading-relaxed">
              {slides[current].subline}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex flex-col gap-5">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-white w-6' : 'bg-white/40 w-1.5'
                }`}
              />
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <Link href="/calculator">
              <button className="w-full py-4 rounded-2xl border border-white/40 text-white font-semibold backdrop-blur-sm bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors text-base">
                Log in
              </button>
            </Link>
            <Link href="/calculator">
              <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-white/90 active:bg-white/80 transition-colors text-base">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
