"""Projection engine interface (docs/FINANCIAL_MODEL.md).

M0 defines the signatures and the golden tests. The implementation arrives in M1.
"""

from decimal import Decimal

from app.schemas.plan import Plan
from app.schemas.results import ProjectionResult
from app.schemas.scenario import Scenario


def inflated_target(target_today: Decimal, annual_rate: Decimal, months: int) -> Decimal:
    """Nominal target after `months`: round(target_today * (1 + annual_rate / 12) ** months)."""
    raise NotImplementedError("Implemented in milestone M1")


def monthly_surplus_series(plan: Plan, scenario: Scenario | None, months: int) -> list[Decimal]:
    """Surplus S_t for months 1..months, after growth steps, commitments and shocks."""
    raise NotImplementedError("Implemented in milestone M1")


def project(
    plan: Plan, scenario: Scenario | None = None, include_monthly: bool = True
) -> ProjectionResult:
    """Run the monthly allocation policy and report per-goal outcomes."""
    raise NotImplementedError("Implemented in milestone M1")
