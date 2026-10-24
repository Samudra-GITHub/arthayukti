# Planned income: conventions

Planned income is what a household expects to earn. It drives surplus, goals, scenarios and rescue.
Money already received is recorded separately as credit transactions and never changes planned income.

## Two forms of stream
- **Legacy** (`monthly_net`, optional `ends_after` month): behaves exactly as before. The plan-wide
  `income_growth_annual` applies on each anniversary of the plan start. Saved plans are not rewritten.
- **Scheduled** (`start_year`, `amount`, `frequency`, optional `end_year`, `annual_growth`, `step_ups`):
  calendar years, its own growth. The plan-wide growth is never applied to it. When a legacy stream is
  edited with a schedule in the app, the plan-wide rate is copied into that stream's own growth so its
  forecast is kept. A legacy stream that ends part-way through a year cannot be converted (a schedule
  ends in December).

## Rules
- Frequencies: monthly, quarterly, yearly. Monthly equivalent = amount / 1, 3 or 12. The division is
  not rounded; each projected month is rounded once, half-up, to the paisa, after growth and step-ups.
  `monthly_net` of a scheduled stream is derived (initial amount, rounded) and any value sent is replaced.
- Start year: from January; not before the plan's first year. End year: inclusive, through December.
- Growth: optional, 0 to 30 %, compounded on the first month of each calendar year after the start year.
  Blank and 0 both mean no automatic increase.
- Step-up: from January of its year the base is replaced by the new amount (same frequency as the stream);
  growth then compounds from it. A step-up wins over growth in the same year. One per year, strictly after
  the start year and not after the end year.
- The plan's first calendar year can be partial; a horizon that ends mid-year counts only the months inside it.
- Technical safeguards only: at most 200 streams per plan and 60 step-ups per stream (request size).

## One calculation path
`engine/flows.month_flows` produces monthly income. `engine/income.project_income` sums those months by
calendar year, and `POST /income/projection` (and `/csv`) return it. The dashboard, chart, table, CSV and
the planner all read this same series.
