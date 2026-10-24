# ArthaYukti

See which goal you lose when money runs short, and the smallest change that fixes it.

ArthaYukti is a focused, explainable decision-support tool for families with several competing money goals. It answers one question well: when money is short, which goal slips, by how much, and what is the smallest change that fixes it.

Built for Srujana Hackathon 2026 (Finance track, problem F-02: Multi-Goal Financial Planning Under Uncertainty).

## What it is, and what it is not

It is not a replacement for banking, budgeting, or investment apps, and it does not claim to be better than them. It does one narrow job and shows its working.

What you can check for yourself:

- **Every number is reproducible.** The same inputs always give the same result. There is no randomness and no black-box model.
- **The rules are written down.** The allocation policy is in [docs/FINANCIAL_MODEL.md](docs/FINANCIAL_MODEL.md), and the tests include hand-checked cases and checks that money is conserved every month.
- **Every suggested fix is verified.** Each option is re-run through the same engine before it is shown, with its cost against the limits you set.
- **Assumptions are visible.** Interest, inflation, and growth are explicit inputs, set to zero in the sample household. Amounts are exact decimals, never floats.
- **It works in plain words.** Short sentences, jars instead of charts, Hindi and English, and a Listen button for people who are new to smartphones.

What it deliberately does not do: predict markets, recommend investments, model taxes, or give financial advice. Uncertainty is explored through what-if scenarios, not probabilities.

## Status

The engine, the API and the screens from the design are built. Deployment is not done yet.

| Part | State |
|---|---|
| Financial model | [docs/FINANCIAL_MODEL.md](docs/FINANCIAL_MODEL.md) |
| API | Projections, fixes and compare are live: [docs/API.md](docs/API.md). Trade-offs and saved plans are contract-only (501) |
| Frontend | All screens from the design, in English and Hindi, at phone, tablet and desktop widths |
| Deployment | Not done yet |

## Layout

```
backend/     FastAPI app, Pydantic schemas, engine (app/engine), tests
frontend/    React app (screens, English and Hindi copy, API client)
contracts/   openapi.json (generated) and sample plans
docs/        financial model, API notes, plans
```

## Run it

Needs Python 3.12 and Node 22 or newer.

```bash
make setup      # virtualenv, backend and frontend dependencies
make dev-api    # API on http://127.0.0.1:8000
make dev-web    # app on http://localhost:5173
make check      # lint, types and tests for both halves
make gen-api    # regenerate contracts/openapi.json and the frontend types
```

On Windows, `make setup` uses `py -3.12`. Override with `make setup BOOTSTRAP_PYTHON="path/to/python.exe"`.

## Tests

`backend/tests/engine/test_golden.py` holds hand-checked cases that were written before the engine. `test_projection.py` adds income-loss and expense shocks, edge cases, and checks over seeded random plans: money is conserved every month, balances never go negative, results are deterministic, and extra savings never delay a goal.

## Disclaimer

Illustrative decision support under the user's own assumptions. Not financial advice. No taxes are modelled. Sample households are fictional.
