from decimal import Decimal
from typing import Literal

from pydantic import Field

from app.schemas.types import (
    Amount,
    ApiModel,
    DecimalStr,
    Money,
    OptionalShortText,
    ShortText,
)

HouseholdType = Literal["single_earner", "dual_earner", "retiree"]
JobStability = Literal["high", "stable", "moderate", "variable"]
DependantRelationship = Literal["child", "spouse", "parent", "sibling", "other"]


class DependantDetail(ApiModel):
    name: ShortText
    relationship: DependantRelationship
    age: int = Field(ge=0, le=120)
    annual_support_cost: Money = Field(default=Decimal("0.00"))
    notes: OptionalShortText | None = None


class PlannedLifeEvent(ApiModel):
    event_name: ShortText
    years_ahead: int = Field(ge=0, le=50)
    estimated_lump_sum_cost: Money = Field(default=Decimal("0.00"))
    ongoing_monthly_cost: Money = Field(default=Decimal("0.00"))
    description: OptionalShortText | None = None


class HouseholdProfileUpdateRequest(ApiModel):
    primary_earner_age: int | None = Field(default=None, ge=18, le=100)
    household_type: HouseholdType | None = None
    dependants_count: int | None = Field(default=None, ge=0, le=20)
    children_count: int | None = Field(default=None, ge=0, le=15)
    elderly_dependants_count: int | None = Field(default=None, ge=0, le=10)
    monthly_family_support: Money | None = None
    job_stability: JobStability | None = None
    emergency_fund_months_target: int | None = Field(default=None, ge=3, le=24)
    dependants_details: list[DependantDetail] | None = None
    planned_events: list[PlannedLifeEvent] | None = None


class HouseholdProfileResponse(ApiModel):
    """The details the person has provided. A field that was never provided is null, never a default."""

    is_saved: bool
    id: str | None
    primary_earner_age: int | None
    household_type: str | None
    dependants_count: int | None
    children_count: int | None
    elderly_dependants_count: int | None
    monthly_family_support: Amount | None
    job_stability: str | None
    emergency_fund_months_target: int | None
    dependants_details: list[DependantDetail]
    planned_events: list[PlannedLifeEvent]
    updated_at: str | None


class RiskCapacityIndicatorResponse(ApiModel):
    primary_earner_age: int | None
    household_type: str | None
    dependants_count: int | None
    monthly_commitments: Amount
    liquid_reserves: Amount
    reserve_coverage_months: DecimalStr
    recommended_reserve_months: int
    risk_capacity_level: Literal["Low", "Moderate", "High", "Not assessed"]
    explanation: list[str]
