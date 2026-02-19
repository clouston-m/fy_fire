# fy_fire — FIRE Calculator UK

A mobile-first Progressive Web App (PWA) for UK-focused **FIRE** (Financial Independence, Retire Early) planning.

Calculate your FIRE number, track your progress, and see your projected retirement date.

---

## Features

- **FIRE Number calculator** — based on your monthly spending and withdrawal rate
- **Compound growth projection** — accurate month-by-month simulation
- **Savings rate tracking** — as a % of your gross income
- **Progress bar** — shows how close you are to financial independence
- **Projected FIRE date** — calendar month and year
- **Persistent inputs** — saves to `localStorage`, restored on next visit
- **Installable PWA** — add to Android home screen for native app feel
- **Mobile-first** — fully usable on phone, tablet, and desktop

---

## Running Locally

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd fy_fire

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

### First-time setup

1. Install the Vercel CLI (optional but useful):
   ```bash
   npm install -g vercel
   ```

2. Push your code to a GitHub/GitLab/Bitbucket repository.

3. Go to [vercel.com](https://vercel.com) and click **Add New Project**.

4. Import your repository — Vercel auto-detects Next.js settings.

5. Click **Deploy**. Done.

### Automatic preview deployments

Every branch push creates a unique preview URL automatically. No extra configuration needed.

- `main` / `master` → Production URL (e.g. `fy-fire.vercel.app`)
- Any other branch → Preview URL (e.g. `fy-fire-git-feature-branch-yourname.vercel.app`)

### Environment variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

For Vercel, add environment variables in **Project Settings → Environment Variables**.

---

## Sharing Preview URLs

When you want non-technical users to test a preview:

1. Push your changes to a new branch:
   ```bash
   git checkout -b my-feature
   git push origin my-feature
   ```

2. Vercel automatically builds and comments the preview URL on your pull request (if GitHub is connected), or you can find it in the Vercel dashboard under **Deployments**.

3. Share the URL — it looks like:
   `https://fy-fire-git-my-feature-yourname.vercel.app`

No login required to view preview deployments by default.

---

## Project Structure

```
fy_fire/
├── app/
│   ├── layout.tsx          # Root layout: header, footer, PWA meta tags
│   ├── page.tsx            # Home page
│   └── globals.css         # Tailwind + shadcn/ui CSS variables
│
├── components/
│   ├── ui/                 # shadcn/ui components (Button, Input, Slider, etc.)
│   └── calculator/
│       ├── FireCalculatorForm.tsx  # Input form with validation
│       └── FireResults.tsx         # Results dashboard
│
├── lib/
│   ├── types.ts            # TypeScript interfaces and defaults
│   ├── calculations.ts     # All FIRE calculation logic
│   ├── storage.ts          # localStorage helpers
│   └── utils.ts            # Tailwind class merge utility
│
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # PWA icons (replace with custom icons)
│
├── next.config.js          # Next.js config (PWA headers)
├── tailwind.config.ts      # Tailwind config (shadcn/ui theme)
├── vercel.json             # Vercel deployment config
└── .env.example            # Environment variable template
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

## Future Roadmap

This is Phase 1 of a larger FIRE planning platform. Planned additions:

| Phase | Feature |
|---|---|
| 2 | **ISA Bridge Calculator** — model drawing down ISAs before pension age |
| 2 | **Pension Optimizer** — SIPP contributions, tax relief, 55/57 access rules |
| 3 | **Supabase integration** — cloud sync across devices |
| 3 | **User authentication** — save multiple scenarios |
| 4 | **PostHog analytics** — understand usage patterns |
| 4 | **Multi-phase planning** — accumulation → bridge → pension phase |
| 5 | **Scenario comparison** — side-by-side "what if" modelling |

---

## Contributing

This project follows standard Next.js conventions. Before opening a PR:

```bash
npm run lint    # ESLint check
npm run build   # Production build (catches type errors)
```

---

## Disclaimer

**fy_fire is not financial advice.** It is an educational tool to help explore FIRE concepts using simplified assumptions. Past investment returns do not guarantee future results. Please consult a qualified financial adviser (ideally a fee-only IFA) before making significant financial decisions.
