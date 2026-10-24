# Backend handoff

For the developer who will work on the ArthaYukti backend. Read this top to bottom once, then start with [Your first tasks](#your-first-tasks).

## What exists already

The backend is not a skeleton. The financial engine, the fix search and the scenario comparison are **implemented, tested and live**. What is left is the trade-off matrix, saved plans, and some hardening.

| Area | Status |
|---|---|
| Financial engine (monthly allocation, targets, shocks, outcomes) | Done. 184 backend tests pass. |
| `POST /projections` | Done |
| `POST /fixes` (verified minimal fixes) | Done |
| `POST /compare` | Done |
| `GET /health`, `GET /samples`, `GET /samples/{id}` | Done |
| `POST /tradeoffs` | **Not implemented.** Validates input, then returns 501. Schemas exist. |
| `POST /plans`, `GET /plans`, `GET /plans/{id}`, `PUT /plans/{id}` | **Not implemented.** Validate input, then return 501. Schemas exist. |

A route or schema existing does not mean the feature works. Only the rows marked Done do.

## Setup

Needs Python 3.12. Run from the repository root.

```bash
git clone https://github.com/Samudra-GITHub/arthayukti.git
cd arthayukti
git fetch origin
git switch -c feat/backend-tradeoffs origin/main     # your own branch, never main
cd backend
py -3.12 -m venv .venv                               # macOS or Linux: python3.12 -m venv .venv
.venv\Scripts\python -m pip install -e ".[dev]"      # macOS or Linux: .venv/bin/python
```

Always use the **editable** install (`-e`). The API reads the sample plans from `contracts/samples/` next to the backend folder, so the code must run from the repository checkout.

| Task | Command (from `backend/`) |
|---|---|
| Run the API | `.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000` |
| Interactive docs | open `http://127.0.0.1:8000/docs` |
| Run the tests | `.venv\Scripts\python -m pytest -q` (expect `184 passed`) |
| Lint and format check | `.venv\Scripts\python -m ruff check .` and `.venv\Scripts\python -m ruff format --check .` |
| Regenerate the API contract | `.venv\Scripts\python -m app.export_openapi` |

The root `Makefile` has `make setup`, `make dev-api`, `make check` and `make gen-api` shortcuts. `make setup` has not been tried from a clean clone, so prefer the commands above.

## Where things are

```
backend/
  pyproject.toml                  dependencies (FastAPI, Uvicorn and Pydantic are pinned)
  app/
    main.py                       app entry point: CORS (ALLOWED_ORIGINS), routers under /api/v1
    errors.py                     one error shape for every failure
    timeline.py                   month arithmetic
    api/
      health.py, samples.py       implemented
      analysis.py                 /projections, /fixes, /compare implemented; /tradeoffs returns 501
      plans.py                    all four routes return 501
      common.py                   shared error-response declarations
    schemas/                      Pydantic models: the single source of truth for the API
      types.py                    money, rate and month types (decimal strings, never floats)
      plan.py, scenario.py        inputs
      results.py                  outputs, including the trade-off and fix results
      requests.py                 request bodies, saved-plan and sample models
    engine/                       the financial logic. No web-framework imports.
      money.py                    rounding rules and the precision context
      setup.py                    turns a plan plus a scenario into engine inputs
      flows.py                    monthly income, spending and surplus
      projection.py               the monthly allocation loop and the per-goal outcomes
      fixes.py                    verified minimal-fix search
      compare.py                  scenario comparison
    export_openapi.py             writes contracts/openapi.json
  tests/
    engine/test_golden.py         hand-checked reference cases
    engine/test_projection.py     shocks, edge cases, seeded invariants (113 tests)
    engine/test_fixes.py          fixes and compare
    engine/test_money.py          rounding helpers
    api/test_api.py               endpoint behaviour
    test_schemas.py               input validation
    test_contract.py              fails if contracts/openapi.json is out of date
contracts/
  openapi.json                    generated API contract
  samples/household.json          sample household used by the demo
  samples/tiny_delayed_goal.json  one-goal case behind golden test T3
```

Not created yet: `backend/app/engine/tradeoffs.py` and `backend/app/storage/`.

## How a request flows

```
Frontend (frontend/src/api/client.ts)
  -> FastAPI route (app/api/analysis.py)         Pydantic validates the body (422 if invalid)
  -> engine function (app/engine/*.py)           pure Python over Decimal
  -> Pydantic result model                       serialised as JSON, money as strings
```

The engine never imports FastAPI or Starlette. Call it directly in tests with no web layer. A `ValueError` raised by the engine becomes a 422 with code `scenario_invalid`.

## Endpoints

Base path `/api/v1`. All money and rates are **decimal strings** such as `"90000.00"`. JSON numbers are rejected. Unknown fields are rejected. Months are `YYYY-MM`.

Every failure has this shape:

```json
{ "error": { "code": "validation_error", "message": "The request is invalid.",
             "details": [ { "loc": ["body", "plan", "goals", 0, "target_date"], "msg": "..." } ] } }
```

Codes: `validation_error` (422), `scenario_invalid` (422), `not_found` (404), `not_implemented` (501), `internal_error` (500).

| Endpoint | Request body | Response |
|---|---|---|
| `GET /health` | none | `{"status":"ok"}` |
| `GET /samples`, `GET /samples/{id}` | none | list of samples, or `{id, name, description, plan, scenarios}` |
| `POST /projections` | `{plan, scenario?, include_monthly?}` | `ProjectionResult` |
| `POST /fixes` | `{plan, scenario?}` | `FixResult` |
| `POST /compare` | `{plan, scenarios}` (2 or 3) | `CompareResult` |
| `POST /tradeoffs` | `{plan, scenario?}` | `TradeoffResult` (**to build**) |
| `POST /plans` (201), `GET /plans`, `GET /plans/{id}`, `PUT /plans/{id}` | a `Plan` | `PlanRecord` or `PlanSummary` list (**to build**) |

The exact field lists are in `contracts/openapi.json`, with the explanation in [API.md](API.md). The Pydantic models in `app/schemas/` are the source of truth.

### Trying it out

```bash
# list the samples
curl -s http://127.0.0.1:8000/api/v1/samples

# run the one-goal reference case through the engine
python - <<'EOF'
import json, urllib.request
base = "http://127.0.0.1:8000/api/v1"
sample = json.load(urllib.request.urlopen(base + "/samples/tiny_delayed_goal"))
def post(path, body):
    request = urllib.request.Request(base + path, data=json.dumps(body).encode(),
                                     headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(request))
result = post("/projections", {"plan": sample["plan"], "include_monthly": False})
goal = result["goals"][0]
print(goal["status"], goal["delay_months"], goal["projected_completion"])   # delayed 4 2028-02
fixes = post("/fixes", {"plan": sample["plan"]})
print([(option["lever"], option["magnitude"]) for option in fixes["options"]])
EOF
```

Expected output: `delayed 4 2028-02`, then the three fix options: `delay_goal 4`, `extra_savings 10000.00`, `reduce_target 20`.

## Financial rules you must follow

The full, frozen rules are in [FINANCIAL_MODEL.md](FINANCIAL_MODEL.md). Do not change them without agreement and a matching change to the golden tests. The essentials:

- **Decimal only.** No `float` anywhere in `app/`. Money enters as a decimal string and leaves as one. Run engine code inside `engine_context()` (precision 40) from `app/engine/money.py`.
- **Rounding.** Round half-up to the paisa with `quantize()`. Round a *required* amount **up** with `ceil_paise()`, so a requirement is never understated.
- **Rates.** Nominal annual, compounded monthly (rate divided by 12), always with integer exponents. Every rate is an explicit input. There are no defaults.
- **Monthly step.** Growth on unfinished goals first. Then, if the surplus is zero or more, pass 1 pays each goal in priority order the level amount that reaches its deadline. Pass 2 spends what is left on unfinished goals in priority order. Any remainder becomes free cash.
- **Deficits.** Cover from free cash, then emergency-fund goals, then other goals from the lowest priority up. Anything uncovered is reported as an uncovered deficit and is never hidden.
- **Completion.** A goal completes in the first month its balance reaches its target for that month. An emergency fund (a revolving goal) counts as on time only if it is still funded at its deadline.
- **Determinism.** No randomness. Sort by priority, then by id.
- **Month 1** is the plan's `as_of` month. A goal may be due in that first month.

### Hand-checked reference cases

| Case | Expected |
|---|---|
| 1,00,000 at 12% a year for 12 months | 1,12,682.50 |
| Income 1,00,000, expenses 60,000, EMI 10,000 for 3 months | surplus 30,000 for months 1 to 3, then 40,000 |
| Surplus 30,000, goal 6,00,000 by month 12, 1,20,000 saved | shortfall 1,20,000 at the deadline, completes 2028-02, 4 months late |
| Two goals of 3,00,000 (months 6 and 12), surplus 50,000 | both on time; reverse the ranks and the goal due in month 6 is 6 months late |
| Income stops in months 4 and 5 | withdrawals in those months, completion 5 months late |
| Fix costs for the delayed goal | delay 0.167, extra savings 0.556, lower target 1.000 |

## Your first tasks

| Order | Task | Depends on | Definition of done |
|---|---|---|---|
| 1 | **Trade-off matrix.** Create `app/engine/tradeoffs.py` with `tradeoffs(plan, scenario=None) -> TradeoffResult`. For each goal, move it to priority 1 (the others keep their relative order), run `project()`, and record each goal's status, delay and today's-money shortfall. Wire it into `app/api/analysis.py` and remove the 501. | none | The model doc (section 10) is followed. A hand-checked test on the two-goal case: prioritising the later goal first makes the earlier goal 6 months late, so that row has `goals_missed` 1, `total_delay_months` 6 and a shortfall of 150000.00 (checked against the current engine). Results are identical on every run. Eight goals finish in well under a second. Contract regenerated (see below). |
| 2 | **Saved plans.** Create `app/storage/` (a SQLite table of validated plan JSON, using the standard library) and implement the four `/plans` routes. | none | Create, list, load and edit work. An unknown id returns the 404 error shape. Invalid plans return 422. Tests cover each route. Note that Render's free disk does not persist across restarts. |
| 3 | **Hardening.** An environment override for the samples folder (`SAMPLES_DIR`). A guard so repeated `/fixes` calls cannot hog the server. A Python lockfile. Tests with extreme inputs. | none | No input from the schema's allowed range causes a 500. |
| 4 | **Best-order search** (optional). The best priority order for N of 5 or fewer goals. | task 1 | Needs a new field in the result, so **agree the contract change first**. |

### The pattern to copy

Look at `app/engine/fixes.py` and `tests/engine/test_fixes.py`. They show the shape: a pure function in `engine/`, a thin route in `api/`, hand-checked expectations in the tests.

Existing interfaces you can call:

```python
project(plan, scenario=None, include_monthly=True) -> ProjectionResult      # engine/projection.py
find_fixes(plan, scenario=None) -> FixResult                                # engine/fixes.py
compare(plan, scenarios) -> CompareResult                                   # engine/compare.py
resolve(plan, scenario) -> Resolved                                         # engine/setup.py
```

## Changing the API contract

The frontend's types are generated from the contract, so a schema change affects it.

1. Change the Pydantic models in `app/schemas/`.
2. Regenerate the contract: `.venv\Scripts\python -m app.export_openapi`.
3. Regenerate the frontend types: from `frontend/`, run `npm run gen:api`.
4. Commit **both** generated files, and tell the frontend owner.

`tests/test_contract.py` fails if `contracts/openapi.json` does not match the code. The frontend only uses `/samples`, `/projections`, `/fixes` and `/compare` today, so building `/tradeoffs` and `/plans` will not break it. Removing the 501 declaration from a route still changes the contract file, so regenerate it.

## Acceptance for any pull request

- `pytest -q` passes, and nothing is skipped or marked as an expected failure.
- `ruff check .` and `ruff format --check .` are clean.
- New financial behaviour has a hand-checked test, not just a snapshot of what the code returns.
- No `float` in `app/`. Money is `Decimal`, and strings on the wire.
- The model document and the contract are unchanged, unless the change was agreed and explained in the pull request.

## Known issues and risks

- **Extreme inputs are not fuzzed.** Very large targets with high rates over 600 months have not been tested. An unhandled decimal error would appear as a 500.
- **`/fixes` costs about 0.3 to 0.4 seconds** on the sample household, and there is no rate limit.
- **Spare money speeds goals up.** With no growth, a goal can show as ready years before its deadline. This is by design in the model, but can need explaining.
- **Frontend tests mock the network.** No automated test runs the real frontend against the real API.
- **Python dependencies are only partly pinned.** FastAPI, Uvicorn and Pydantic are pinned, but there is no lockfile.
- **Test-client warning.** Starlette warns that `httpx` is deprecated for its test client. It is harmless.
- **Merging to `main` redeploys the live sites.** The API is on Render and the frontend on Vercel, both from `main`.

## Who does what

| Backend developer | Frontend and deployment owner |
|---|---|
| Trade-off matrix, saved plans, hardening, backend tests | Trade-off matrix screen (after task 1), live sites, labels and wording |
| Keeps `API.md` accurate for anything they change | Reviews contract changes and regenerates frontend types if needed |
| Opens pull requests into `main`, never pushes to it directly | Merges, and checks the live sites after a merge |

## Git workflow

1. Branch from `origin/main`, one branch per task: `feat/backend-tradeoffs`, `feat/backend-plans`.
2. Commit small and often. Run `pytest -q` and `ruff` before each push.
3. Push your branch: `git push -u origin feat/backend-tradeoffs`.
4. Open a pull request into `main` on GitHub, and describe what changed and how you checked it.
5. Wait for a review. Never push directly to `main`.
6. After a merge, update your local copy: `git fetch origin && git switch -c <next-branch> origin/main`.

Never commit secrets, `.env` files or keys. The backend needs none: its only setting is `ALLOWED_ORIGINS`.
