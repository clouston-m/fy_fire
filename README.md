# fy_fire — FIRE Calculator UK

A mobile-first Progressive Web App for UK-focused **FIRE** (Financial Independence, Retire Early) planning. Calculate your FIRE number, model your ISA bridge, and see your projected retirement date.

## Running Locally

**Prerequisites:** Node.js 18+, npm 9+

```bash
git clone https://github.com/clouston-m/fy_fire.git
cd fy_fire
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Pushing to `main` triggers a production deploy on Vercel automatically.

```bash
git push origin main
```

> If you hit a 403, run `gh auth setup-git` first (work credential conflict).

## Calculation Methodology

| Formula | Description |
|---|---|
| `Annual Expenses = Monthly Spending × 12` | Total annual retirement spending |
| `FIRE Number = Annual Expenses × (100 ÷ Withdrawal Rate)` | Portfolio needed to retire |
| `Gap = FIRE Number − Current Net Worth` | Remaining to invest |
| `Savings Rate = (Contributions ÷ Income) × 100` | % of income invested |
| `Years to FIRE` | Month-by-month compound growth simulation |

Growth simulation: `portfolio = portfolio × (1 + monthlyRate) + monthlyContributions` — repeated until `portfolio ≥ FIRE Number` or 100 years is reached.

## Disclaimer

**fy_fire is not financial advice.** It is an educational tool to help explore FIRE concepts using simplified assumptions. Past investment returns do not guarantee future results. Please consult a qualified financial adviser before making significant financial decisions.
