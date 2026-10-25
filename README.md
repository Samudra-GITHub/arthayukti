# ArthaYukti

**See which goal you lose when money runs short, and the smallest change that fixes it.**

ArthaYukti is a planning tool for people and households with several money goals at once: an emergency fund, a home, a child's education, retirement, a vehicle. When your income can't cover every goal, it shows which goal slips, by how long, and what the smallest fix is. Everything is calculated from your own numbers by a fixed set of written rules, so the same inputs always give the same answer.

Built for Srujana Hackathon 2026 (Finance track, problem F-02: Multi-Goal Financial Planning Under Uncertainty).

Live site: https://arthayukti.vercel.app

> **Not financial advice.** ArthaYukti works only from the numbers you enter. It does not predict markets, recommend investments, or model taxes. The example households are fictional.

---

## Using the web app for the first time

### 1. Try it without an account

Open the site and choose **Look at an example household**. You get a made-up family with real results, and nothing you do is saved. Refreshing clears it.

### 2. Make your own plan

Choose **Start with my numbers** (to try it without saving) or **Create an account** to keep your work. An account needs only a name, an email and a password, and takes you straight to the Dashboard. You can then add your numbers in any order, or use the optional **guided setup**, which walks through three short steps:

1. **Money in:** your income.
2. **Money out:** your monthly spending.
3. **Dreams:** your goals, how much each needs, by when, and in which order they matter to you.

Then you land on the **Dashboard**: where you stand, and for each goal whether it is **on time** or **late** (and by how many months).

### 3. Find your way around

The top bar groups the app. The left menu lists the pages.

| Page | What it is for |
| --- | --- |
| **Dashboard** | Your position at a glance. A new account lands here with a short "where to start" guide: nothing is filled in for you. |
| **User Profile** | Your details, the household context used for planning, and your risk comfort. |
| **Income and Expenditures** | Your incomes, your monthly spending, and a place to record transactions or import a CSV file. |
| **Calculators** | Three modules, each worked out by the same engine as the rest of the app: **Insurance** (policies, premiums, cover over time, reminders), **Debts** (a loan repayment calculator, the effect of extra payments, and which debt to pay first) and **Equities** (the investment calculator with growth, tax and inflation, plus your holdings and balances). |
| **Emergency Funds** | What you hold, your own target in months of essential spending, progress, and how the plan grows the reserve. |
| **Financial goals** | Your goals in funding order, the tools below, and the Plan B banner. |
| **Financial outlook** | Trajectories, goal feasibility and scenario comparison. |
| **Plan B and Rescue** | Replan around a disruption while protecting what you choose (see below). |
| **Alerts** | Reminders such as insurance renewals. |
| **Settings** | Language, the **Default Inflation Rate**, data export and account deletion. |

The **Default Inflation Rate** (Settings) is the starting annual inflation for new plans and new investments. Saved calculations, saved plans and Recovery Agreements keep the rate they were saved with, and you can still override it for a single investment.

Handy extras: **English / हिन्दी** in the top bar, a light/dark theme toggle, and **Listen** to hear a page read aloud.

### 4. The tools on the Financial goals page

Open **Financial goals** and look under **Explore**:

- **Which goal goes first?** Put a different goal first and see what happens to the others.
- **What if life changes?** Try a drop in income or a surprise expense.
- **Smallest fixes:** options that bring late goals back on time, smallest change first. Each one is re-checked before it is shown.
- **Compare a fix:** two plans side by side.
- **Rescue analysis:** set your own limits (for example "never save more than X a month") and see what still works.
- **Goal feasibility:** a plain yes or no for each goal, with the reason.

### 5. Plan B: when income drops or a new cost arrives

At the top of **Financial goals** is the **Plan B** banner. Use it when something has actually changed: your income fell, you lost it for a while, or a new recurring cost started. Plan B is built around a simple idea: *you* decide what is protected.

1. **Something changed:** pick which of the three situations applies.
2. **Describe it:** dates, how long it lasts, your cash and your safety floor (the cash level you never want to fall below).
3. **Protect what matters:** mark the things that must not change, like a loan EMI, insurance, or a goal contribution.
4. **Allowed changes:** say what *may* be reduced or paused, and by how much.

Plan B then searches only the changes you allowed and shows you up to three plans, what each one gives up, and what would break it. You can say "I can't change this one" and it searches again without it. It tells you honestly when **no plan works**, and separately when **the search did not finish** (so it never calls something impossible that it simply didn't finish checking).

Pick a plan and **save it as a Recovery Agreement**. An agreement records your chosen plan, a review month, and the conditions for returning to normal (for example "income back to X and I confirm I've recovered"). A date alone never restores anything. You can reopen it later, **review it against today's figures**, and edit it. Every edit adds a new version, and the older ones stay viewable.

Optional AI help (only if the server has a key; otherwise you will see a short note): describe your situation in your own words and the form is filled in for you to check, or get a plain-language explanation of a plan. The AI never calculates and never decides what is feasible. See [docs/AI_GEMINI.md](docs/AI_GEMINI.md).

---

## What you can trust, and what you can't

What you can check for yourself:

- **Every number is reproducible.** No randomness, no black-box model.
- **The rules are written down:** [docs/FINANCIAL_MODEL.md](docs/FINANCIAL_MODEL.md) and [docs/PLAN_B.md](docs/PLAN_B.md). The tests include hand-checked cases and checks that money is conserved every month.
- **Money is exact.** Amounts are decimals, never floating-point.
- **Assumptions are visible.** Interest, inflation and growth are explicit inputs, set to zero in the sample household.
- **Plain words.** Short sentences, Hindi and English.

What it deliberately does not do: predict markets, recommend investments, model taxes, or give advice. Plan B does not calculate how long a goal is delayed; it shows the rupees deferred instead.

**Known limits**

- A Plan B review rebuilds the past from the saved plan; it can't take your real past figures.
- Hindi text has not been reviewed by a native speaker, and a few server-written sentences are English only.
- Optional AI help has been tested only against a stand-in, not a live Gemini key.
- On the hosted demo, saved data may be wiped when the server restarts until a permanent database is connected (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md)).

---

## Run it on your own computer

You need **Python 3.12**, **Node 22 or newer**, and `make`.

```bash
make setup      # creates the virtualenv and installs backend and frontend dependencies
make dev-api    # API on http://127.0.0.1:8000
make dev-web    # app on http://localhost:5173  (run in a second terminal)
```

Open http://localhost:5173. On Windows, `make setup` uses `py -3.12`; override with `make setup BOOTSTRAP_PYTHON="path/to/python.exe"`.

Other commands:

```bash
make check      # lint, types and tests for both halves
make gen-api    # regenerate contracts/openapi.json and the frontend types
```

### Configuration

Copy `.env.example` to `backend/.env` and edit. The defaults work for local use (SQLite file, a temporary signing key). Never commit the real `.env`.

| Setting | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite by default; use a PostgreSQL URL for a real deployment. Run `cd backend && alembic upgrade head` to create or update the schema. |
| `SECRET_KEY` | Required outside development: at least 32 random characters. |
| `ALLOWED_ORIGINS` | Web addresses allowed to call the API. |
| `GEMINI_API_KEY` | Optional. Turns on the AI help in Plan B. Backend only; never put it in a frontend file. |

The frontend reads `VITE_API_BASE_URL` to find the API when it is not on the same address.

## How it is built

```
backend/     FastAPI + Pydantic + SQLAlchemy/Alembic; the calculation engine is in app/engine
frontend/    React 19, TypeScript, Vite, Tailwind; English and Hindi copy; API client
contracts/   openapi.json (generated) and sample plans
docs/        financial model, API notes, Plan B, AI help, deployment, readiness
```

- The calculation engine is plain, deterministic Python. The API and the screens only present its results.
- The API contract in `contracts/openapi.json` is generated from the backend and checked by a test, and the frontend types are generated from it.
- Deployed from `main`: the API on Render, the site on Vercel.

## Tests

`make check` runs everything. At the time of writing: **634 backend tests** (on SQLite and on PostgreSQL) and **200 frontend tests** pass, with ruff, TypeScript, oxlint and the production build clean.

The most important ones: `backend/tests/engine/test_golden.py` (hand-checked cases written before the engine), `test_projection.py` (income-loss and expense shocks, and seeded random plans: money conserved every month, balances never negative, deterministic results, extra savings never delay a goal), and the `test_recovery_*` files (Plan B month-by-month arithmetic, search, restoration, review and agreements).

## More documentation

- [docs/FINANCIAL_MODEL.md](docs/FINANCIAL_MODEL.md): the allocation rules
- [docs/PLAN_B.md](docs/PLAN_B.md) and [docs/PLAN_B_STAGE7_AUDIT.md](docs/PLAN_B_STAGE7_AUDIT.md): Plan B conventions and the verification audit
- [docs/AI_GEMINI.md](docs/AI_GEMINI.md): optional AI help, its safeguards and setup
- [docs/API.md](docs/API.md): endpoints
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md): going live

## Disclaimer

Illustrative decision support under the user's own assumptions. Not financial advice. No taxes are modelled. Sample households are fictional.
