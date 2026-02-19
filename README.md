# fy_fire — FIRE Calculator UK

A mobile-first Progressive Web App (PWA) for UK-focused **FIRE** (Financial Independence, Retire Early) planning.

Calculate your FIRE number, track your progress, and see your projected retirement date.

---

## Features

- **Multi-step wizard UI** — one input per screen, focused mobile experience
- **FIRE Number calculator** — based on your monthly spending and withdrawal rate
- **Compound growth projection** — accurate month-by-month simulation
- **Savings rate tracking** — as a % of your gross income
- **Progress bar** — shows how close you are to financial independence
- **Projected FIRE date** — calendar month and year
- **Persistent inputs** — saves to `localStorage`, restored on next visit
- **Installable PWA** — add to home screen for native app feel
- **Mobile-first** — fully usable on phone, tablet, and desktop

---

## Running Locally

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
git clone https://github.com/clouston-m/fy_fire.git
cd fy_fire
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

The app is deployed on Vercel. Pushing to `main` triggers a production deploy automatically — no manual steps needed.

```bash
git push origin main
```

> **Note:** If you hit a 403 due to a conflicting GitHub credential, run `gh auth setup-git` first.

---

## Project Structure

```
fy_fire/
├── app/
│   ├── layout.tsx          # Root layout: PWA meta tags, service worker
│   ├── page.tsx            # Home page — renders FireCalculatorForm
│   └── globals.css         # Tailwind + shadcn/ui CSS variables + wizard animations
│
├── components/
│   ├── ui/                 # shadcn/ui components (Button, Slider, etc.)
│   └── calculator/
│       ├── FireCalculatorForm.tsx  # 6-step wizard UI
│       └── FireResults.tsx         # Results dashboard
│
├── lib/
│   ├── types.ts            # TypeScript interfaces, defaults, constraints
│   ├── calculations.ts     # All FIRE calculation logic
│   ├── storage.ts          # localStorage helpers
│   └── utils.ts            # Tailwind class merge utility
│
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # PWA icons
│
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config (shadcn/ui theme)
└── vercel.json             # Vercel deployment config (headers for SW/manifest)
```

---

## Calculation Methodology

| Formula | Description |
|---|---|
| `Annual Expenses = Monthly Spending × 12` | Total annual retirement spending |
| `Multiplier = 100 ÷ Withdrawal Rate` | The "25× rule" at 4% |
| `FIRE Number = Annual Expenses × Multiplier` | Total portfolio needed |
| `Gap = FIRE Number − Current Net Worth` | Remaining to save |
| `Savings Rate = (Contributions ÷ Income) × 100` | % of income invested |
| `Years to FIRE` | Month-by-month compound growth simulation |

The years-to-FIRE calculation simulates monthly portfolio growth:

```
portfolio = portfolio × (1 + monthlyRate) + monthlyContributions
```

Repeated until `portfolio ≥ FIRE Number` or 100 years is reached.

---

## Roadmap

| Phase | Feature |
|---|---|
| 1 | **Intro / compliance screen** — disclaimer before first use |
| 2 | **ISA Bridge Calculator** — model drawing down ISAs before pension age |
| 2 | **Pension Optimizer** — SIPP contributions, tax relief, 55/57 access rules |
| 3 | **Supabase integration** — cloud sync across devices |
| 3 | **User authentication** — save multiple scenarios |
| 4 | **Multi-phase planning** — accumulation → bridge → pension phase |
| 4 | **Scenario comparison** — side-by-side "what if" modelling |

---

## Disclaimer

**fy_fire is not financial advice.** It is an educational tool to help explore FIRE concepts using simplified assumptions. Past investment returns do not guarantee future results. Please consult a qualified financial adviser before making significant financial decisions.
