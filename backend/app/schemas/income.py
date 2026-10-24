from pydantic import BaseModel, Field, model_validator

from app.schemas.plan import Plan
from app.schemas.types import Amount, ApiModel
from app.timeline import MAX_HORIZON_MONTHS


class IncomeProjectionRequest(BaseModel):
    """`plan_id` uses the signed-in user's saved plan; `plan` projects an explicit hypothetical plan."""

    plan_id: str | None = None
    plan: Plan | None = None
    horizon_months: int = Field(default=60, ge=1, le=MAX_HORIZON_MONTHS)

    @model_validator(mode="after")
    def exactly_one_plan_source(self) -> "IncomeProjectionRequest":
        if (self.plan_id is None) == (self.plan is None):
            raise ValueError("Send either plan_id (a saved plan) or plan (a hypothetical plan), not both or neither.")
        return self


class IncomeYear(ApiModel):
    year: int
    months_included: int
    annual_income: Amount
    cumulative_income: Amount


class IncomeProjectionResponse(ApiModel):
    plan_source: str  # "saved" or "hypothetical"
    horizon_months: int
    first_month: str
    total_projected_income: Amount
    years: list[IncomeYear]
