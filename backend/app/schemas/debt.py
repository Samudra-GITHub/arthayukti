from decimal import Decimal

from pydantic import Field

from app.schemas.types import (
    Amount,
    ApiModel,
    Money,
    Rate,
    ShortText,
)


class AmortizationScheduleItem(ApiModel):
    month: int
    payment: Amount
    principal_paid: Amount
    interest_paid: Amount
    extra_payment: Amount
    remaining_balance: Amount


class AmortizationRequest(ApiModel):
    principal: Money
    annual_interest_rate: Rate
    tenure_months: int = Field(ge=1, le=1200)
    monthly_emi: Money | None = None
    extra_monthly_payment: Money = Field(default=Decimal("0.00"))


class AmortizationResponse(ApiModel):
    monthly_emi: Amount
    total_principal: Amount
    total_interest_paid: Amount
    total_amount_paid: Amount
    effective_months: int
    months_saved: int
    interest_saved: Amount
    schedule: list[AmortizationScheduleItem]


class DebtItemInput(ApiModel):
    id: str
    name: ShortText
    balance: Money
    interest_rate: Rate
    monthly_emi: Money


class StrategyPayoffOrder(ApiModel):
    id: str
    name: str
    payoff_month: int


class StrategySummary(ApiModel):
    total_interest_paid: Amount
    months_to_debt_free: int
    payoff_order: list[StrategyPayoffOrder]


class StrategyComparisonRequest(ApiModel):
    debts: list[DebtItemInput] | None = None
    extra_monthly_budget: Money = Field(default=Decimal("0.00"))


class StrategyComparisonResponse(ApiModel):
    avalanche: StrategySummary
    snowball: StrategySummary
    interest_difference: Amount
    time_difference_months: int
    recommendation: str
