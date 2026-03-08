# fy_fire

## What This Is
UK-focused FIRE (Financial Independence, Retire Early) calculator PWA. Users move through a **Plan → Optimise → Track** journey to model their path to financial independence. No backend — all state is localStorage.

Deployed on Vercel. Repo: `clouston-m/fy_fire`.

## Tech Stack
- **Next.js 14.2** (App Router) · React 18 · TypeScript 5
- **Tailwind CSS 3.4** + shadcn/ui (Radix UI primitives)
- **PWA**: service worker + manifest for mobile install
- No auth, no database, no API routes

## Routing
| Route | Purpose |
|---|---|
| `/` | Landing page — image carousel, Login/Sign up buttons → `/pathway` |
| `/pathway` | Journey hub — Plan/Optimise/Track phase nodes + FIRE results sheet |
| `/calculator` | Plan phase — 8-step wizard, redirects to `/pathway` on complete |

## Key Files
| File | Role |
|---|---|
| `lib/types.ts` | `FireInputs`, `FireResults` interfaces + constants (`PENSION_ACCESS_AGE = 57`) |
| `lib/calculations.ts` | Pure FIRE calculation engine — no side effects |
| `lib/storage.ts` | localStorage: save/load inputs, `markPlanComplete` / `isPlanComplete` |
| `components/LandingPage.tsx` | Full-screen auto-advancing image carousel |
| `components/PathwayScreen.tsx` | Phase list (Plan/Optimise/Track) + shadcn Drawer for FIRE results |
| `components/calculator/FireCalculatorForm.tsx` | 8-step wizard; on final step calls `markPlanComplete()` then `router.push('/pathway')` |
| `components/calculator/FireResults.tsx` | Results cards (FIRE number, progress, ISA bridge, stats) |
| `app/globals.css` | Tailwind base + `wizard-enter-forward/back`, `pathway-pulse` animations (pathway-pulse unused since pathway redesign) |

## Build State
- **Plan**: Complete. Calculator → marks complete in localStorage → `/pathway`
- **Optimise**: Not built. Active node on pathway shows disabled "Next" button
- **Track**: Not built. Locked node on pathway

## Core Data Flow
`FireInputs` (8 user inputs) → `calculateFire()` → `FireResults` (25+ fields)

Month-by-month compound growth simulation. UK-specific: pension access age 57, ISA bridge period calculation for early retirees.

## Architecture Rules
- Calculations are **pure functions** in `lib/` — keep UI logic out
- **Always use shadcn/ui components** where a suitable one exists. Only build custom UI if no shadcn component fits — and confirm with the user before doing so
- `max-w-2xl` lives on the calculator page wrapper, not in layout

## shadcn/ui Components Available
Button · Card · Input · Label · Slider · Progress · Badge · Separator · Drawer · Alert · Field
**Not installed**: Dialog, Sheet, Select, Tabs

## UI Conventions
- Landing page: white-gradient bottom (transparent → white at 68%), dark text (`text-primary`)
- Pathway: `bg-white` light
- Calculator + results sheet: light/white, card-based
- Mobile-first; touch targets min 44px

## Deployment
```bash
gh auth setup-git   # always run first — work credentials conflict
git push
```
Vercel auto-deploys on push to `main`.
