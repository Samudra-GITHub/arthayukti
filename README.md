# ArthaYukti

See which goal you lose when money runs short, and the smallest change that fixes it.

ArthaYukti helps individuals and couples plan several competing financial goals. It shows when money is insufficient, compares alternative plans, simulates unexpected changes, and suggests the smallest verified change that makes the plan work.

Built for Srujana Hackathon 2026 (Finance track, problem F-02: Multi-Goal Financial Planning Under Uncertainty).

## Status

Milestone M1 (the calculation engine) is done. Next: the frontend screens.

| Part | State |
|---|---|
| Financial model | Frozen: [docs/FINANCIAL_MODEL.md](docs/FINANCIAL_MODEL.md) |
| API contract | Frozen: [docs/API.md](docs/API.md), [contracts/openapi.json](contracts/openapi.json) |
| Backend | Projection engine and `POST /api/v1/projections` are live. Trade-offs, fixes, compare and saved plans are contract-only (501) |
| Frontend | Vite, React, TypeScript and Tailwind shell with generated API types. Screens not built yet |
| Deployment | Not done yet |

## Layout

```
backend/     FastAPI app, Pydantic schemas, engine (app/engine), tests
frontend/    React app
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
