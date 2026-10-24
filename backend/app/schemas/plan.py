from decimal import Decimal
from typing import Literal

from pydantic import Field, model_validator

from app.schemas.types import (
    ApiModel,
    Fraction,
    GrowthRate,
    Id,
    Label,
    Money,
    Month,
    PositiveMoney,
    Rate,
)
from app.timeline import MAX_HORIZON_MONTHS, deadline_index, month_to_index

GoalType = Literal["home", "education", "loan_payoff", "emergency_fund", "retirement", "custom"]


class IncomeStream(ApiModel):
    id: Id
    label: Label
    monthly_net: Money
    ends_after: Month | None = None


class Expense(ApiModel):
    id: Id
    label: Label
    monthly: Money
    # Protected by default. Only expenses marked False can be trimmed by the rescue engine.
    essential: bool = True


class Commitment(ApiModel):
    """An existing fixed payment (for example an EMI) that stops after remaining_months."""

    id: Id
    label: Label
    monthly_payment: Money
    remaining_months: int = Field(ge=1, le=MAX_HORIZON_MONTHS)


class Flexibility(ApiModel):
    max_delay_months: int = Field(default=24, ge=0, le=120)
    min_target_pct: Fraction = Field(default=Decimal("0.80"), ge=Decimal("0.50"), le=1)


class Goal(ApiModel):
    id: Id
    label: Label
    type: GoalType
    target_amount_today: PositiveMoney
    target_date: Month
    priority: int = Field(ge=1, le=8)
    inflation_linked: bool
    inflation_rate_override: Rate | None = None
    current_savings: Money = Decimal("0.00")
    flexibility: Flexibility = Field(default_factory=Flexibility)


class Assumptions(ApiModel):
    """Every rate is an explicit input. Annual, nominal, compounded monthly."""

    general_inflation_annual: Rate
    savings_return_annual: Rate
    income_growth_annual: GrowthRate
    expense_growth_annual: GrowthRate


class FixLimits(ApiModel):
    extra_savings_cap_pct_of_income: Fraction = Decimal("0.20")


class Plan(ApiModel):
    name: Label
    as_of: Month
    currency: Literal["INR"]
    income_streams: list[IncomeStream] = Field(min_length=1, max_length=4)
    expenses: list[Expense] = Field(default_factory=list, max_length=12)
    commitments: list[Commitment] = Field(default_factory=list, max_length=6)
    unassigned_savings: Money = Decimal("0.00")
    goals: list[Goal] = Field(min_length=1, max_length=8)
    assumptions: Assumptions
    fix_limits: FixLimits = Field(default_factory=FixLimits)

    @model_validator(mode="after")
    def _check_consistency(self) -> "Plan":
        _require_unique("income stream", [s.id for s in self.income_streams])
        _require_unique("expense", [e.id for e in self.expenses])
        _require_unique("commitment", [c.id for c in self.commitments])
        _require_unique("goal", [g.id for g in self.goals])

        priorities = sorted(g.priority for g in self.goals)
        if priorities != list(range(1, len(self.goals) + 1)):
            raise ValueError("goal priorities must be unique and run 1..n with no gaps")

        as_of_index = month_to_index(self.as_of)
        for goal in self.goals:
            deadline = deadline_index(self.as_of, goal.target_date)
            if deadline < 1:
                raise ValueError(f"goal {goal.id}: target_date must not be before as_of")
            if deadline > MAX_HORIZON_MONTHS:
                raise ValueError(
                    f"goal {goal.id}: target_date is more than {MAX_HORIZON_MONTHS} months away"
                )
        for stream in self.income_streams:
            if stream.ends_after is not None and month_to_index(stream.ends_after) < as_of_index:
                raise ValueError(f"income stream {stream.id}: ends_after is before as_of")
        return self


def _require_unique(kind: str, ids: list[str]) -> None:
    if len(set(ids)) != len(ids):
        raise ValueError(f"{kind} ids must be unique")
