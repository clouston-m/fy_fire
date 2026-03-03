'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const slides = [
  {
    image: '/images/landing-1-background.jpg',
    headline: 'A path of less resistance',
    subline: 'Create a tailored financial plan to gain financial independence and retire early',
    badge: null,
  },
  {
    image: '/images/landing-2-background.jpg',
    headline: 'Powered by community',
    subline: 'Crowdsourced insights from a community of over 100,000 redditors',
    badge: {
      icon: <img src="/icons/reddit-logo.svg" className="w-3.5 h-3.5" alt="" />,
      label: 'Connect with r/FIRE',
    },
  },
  {
    image: '/images/landing-3-background.jpg',
    headline: 'Your data, your way',
    subline: 'Export your data to keep or use with your favourite AI tools like ChatGPT and Claude',
    badge: {
      icon: <img src="/icons/claude-chatgpt-logo.svg" className="w-3.5 h-3.5" alt="" />,
      label: 'Use with ChatGPT, Claude',
    },
  },
];

const SLIDE_DURATION_MS = 10000;

export function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % slides.length;
        setPrev(c);
        setTimeout(() => setPrev(null), 600);
        return next;
      });
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setCurrent(c => {
      if (index === c) return c;
      setPrev(c);
      setTimeout(() => setPrev(null), 600);
      return index;
    });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background slides */}
      {slides.map((slide, i) => {
        const isCurrent = i === current;
        const isPrev = i === prev;
        if (!isCurrent && !isPrev) return null;
        return (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center ${
              isCurrent && prev !== null ? 'slide-image-in' : isPrev ? 'slide-image-out' : ''
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              zIndex: isCurrent ? 2 : 1,
            }}
          />
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[29%] to-white to-[68%] z-[3]" />

      {/* Content */}
      <div className="relative h-full flex flex-col px-6 pb-8 max-w-2xl mx-auto z-[4]" style={{ paddingTop: '32px' }}>

        {/* Slide indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-1 rounded-full flex-1 bg-white/35 overflow-hidden"
            >
              {i === current && (
                <div
                  key={current}
                  className="h-full w-full bg-white rounded-full origin-left"
                  style={{ animation: `slide-progress-fill ${SLIDE_DURATION_MS}ms linear forwards` }}
                />
              )}
              {i < current && (
                <div className="h-full w-full bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Text — remounts on slide change, replays animations */}
        <div className="flex-1 flex flex-col justify-end pb-8">
          <div key={current}>
            {slides[current].badge && (
              <Badge
                className="mb-5 gap-1.5 w-fit anim-fade-up"
                style={{ animationDelay: '400ms' }}
              >
                {slides[current].badge.icon ?? null}
                {slides[current].badge.label}
              </Badge>
            )}
            <h1
              className="text-primary mb-5 anim-fade-up"
              style={{ animationDelay: slides[current].badge ? '500ms' : '400ms' }}
            >
              {slides[current].headline}
            </h1>
            <p
              className="text-primary text-base max-w-xs leading-6 anim-fade-up"
              style={{ animationDelay: slides[current].badge ? '600ms' : '500ms' }}
            >
              {slides[current].subline}
            </p>
          </div>
        </div>

        {/* Buttons — always visible, no animation */}
        <div className="flex flex-col gap-4">
          <Button
            asChild
            className="w-full rounded-lg px-6 font-medium"
          >
            <Link href="/pathway">Get started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-lg px-6 font-medium border-[#d4d4d4] text-foreground bg-transparent hover:bg-black/5 active:bg-black/10"
          >
            <Link href="/pathway">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
