# API contract (v1)

The API serves one narrow job: explainable decision support for competing money goals. Every result is computed by the engine, is reproducible for the same inputs, and every suggested fix is verified by a re-run. It does not predict markets, model taxes, or give advice.

The machine-readable contract is [contracts/openapi.json](../contracts/openapi.json), generated from the Pydantic schemas in `backend/app/schemas/`. The frontend types in `frontend/src/api/schema.d.ts` are generated from it. Regenerate both with `make gen-api`. A backend test fails if the committed file is stale.

Base path: `/api/v1`.

## Conventions

- Money and rates are **decimal strings** (`"600000.00"`, `"0.06"`). JSON numbers are rejected for them.
- Months are `YYYY-MM`. Rates are fractions (0.06 means 6%), nominal annual, compounded monthly.
- Unknown fields are rejected.
- Every failure uses one shape:

```json
{ "error": { "code": "validation_error", "message": "The request is invalid.",
             "details": [ { "loc": ["body", "plan", "goals", 0, "target_date"], "msg": "..." } ] } }
```

Codes in use: `validation_error` (422), `scenario_invalid` (422), `not_found` (404), `not_implemented` (501), `internal_error` (500).

## Endpoints

| Method and path | Purpose | Status |
|---|---|---|
| `GET /health` | Liveness | Implemented (M0) |
| `GET /samples`, `GET /samples/{id}` | Bundled plans and preset scenarios | Implemented (M0) |
| `POST /projections` | Baseline, shock and reprioritisation: a plan plus an optional scenario | Implemented. An inconsistent scenario returns 422 `scenario_invalid` |
| `POST /tradeoffs` | Trade-off matrix | Contract only |
| `POST /fixes` | Verified minimal-fix options | Implemented |
| `POST /compare` | 2-3 scenarios side by side | Implemented |
| `POST /plans`, `GET /plans`, `GET /plans/{id}`, `PUT /plans/{id}` | Save, list, load, edit plans | Contract only |

"Contract only" endpoints validate their input, then answer `501 not_implemented`. They never return invented results.

## Scenario

One object carries everything that differs from the plan, so shocks, reprioritisation, assumption changes and applied fixes all use the same code path.

| Field | Meaning |
|---|---|
| `events` | `income_change` (stream or all, month range, multiplier; 0 means loss), `expense_change` (month range, monthly delta), `one_time_expense`, `one_time_income` |
| `priority_order` | Goal ids in the order to prioritise, or null to keep the plan's priorities |
| `assumption_overrides` | Replacement rates, or null |
| `extra_monthly_savings` | Added to the monthly surplus |
| `goal_overrides` | New `target_date` and/or `target_amount_today` for named goals |

## Worked example

Request body for `POST /projections`: the plan in [contracts/samples/tiny_delayed_goal.json](../contracts/samples/tiny_delayed_goal.json), with `"scenario": null`.

Result for that plan, derived by hand (surplus 30,000, required level amount (6,00,000 - 1,20,000) / 12 = 40,000) and confirmed by the engine as golden test T3:

| Field | Value |
|---|---|
| `status` | `delayed` |
| `required_monthly_level_standalone` | `40000.00` |
| `balance_at_deadline` | `480000.00` |
| `shortfall_at_deadline_nominal` | `120000.00` |
| `projected_completion` | `2028-02` |
| `delay_months` | `4` |

Expected `POST /fixes` options for the same plan, using the default limits (extra savings capped at 20% of income, delay up to 24 months, target no lower than 80%):

| Option | Magnitude | Normalised cost |
|---|---|---|
| Delay the goal | 4 months | 4 / 24 = 0.167 |
| Extra monthly savings | 10,000 | 10,000 / 18,000 = 0.556 |
| Reduce the target | 20% | 20 / 20 = 1.000 |

## Validation rules

- 1-8 goals. Priorities unique and running 1..n with no gaps. Ids unique within each list.
- `target_date` not before `as_of` and at most 600 months away.
- Amounts from 0 to Rs 100 crore with at most 2 decimals. Targets must be above 0.
- Inflation and return rates between 0 and 0.30. Income and expense growth between -0.10 and 0.30.
- Event month ranges ordered and within 600 months. A scenario carries at most 20 events.
