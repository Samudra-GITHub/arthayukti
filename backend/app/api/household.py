import json
import uuid
from datetime import UTC, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.common import AUTH_RESPONSES
from app.api.deps import get_current_user, get_db
from app.db.models import FinancialAccount, HouseholdProfile, Liability, User
from app.schemas.household import (
    DependantDetail,
    HouseholdProfileResponse,
    HouseholdProfileUpdateRequest,
    PlannedLifeEvent,
    RiskCapacityIndicatorResponse,
)

router = APIRouter(prefix="/household", tags=["household"], responses=AUTH_RESPONSES)

# A general reference used only when the person has not set their own reserve target. It is
# labelled as a reference in the explanation and is never stored on their profile.
REFERENCE_RESERVE_MONTHS = 6


def _find_profile(user: User, db: Session) -> HouseholdProfile | None:
    return db.query(HouseholdProfile).filter(HouseholdProfile.user_id == user.id).first()


def _create_profile(user: User, db: Session) -> HouseholdProfile:
    """An empty profile: every detail stays null until the person provides it."""
    now = datetime.now(UTC)
    profile = HouseholdProfile(
        id=str(uuid.uuid4()),
        user_id=user.id,
        dependants_details_json="[]",
        planned_events_json="[]",
        created_at=now,
        updated_at=now,
    )
    db.add(profile)
    return profile


def _to_profile_response(p: HouseholdProfile | None) -> HouseholdProfileResponse:
    if p is None:
        return HouseholdProfileResponse(
            is_saved=False,
            id=None,
            primary_earner_age=None,
            household_type=None,
            dependants_count=None,
            children_count=None,
            elderly_dependants_count=None,
            monthly_family_support=None,
            job_stability=None,
            emergency_fund_months_target=None,
            dependants_details=[],
            planned_events=[],
            updated_at=None,
        )
    dep_list = []
    if p.dependants_details_json:
        try:
            dep_list = [DependantDetail.model_validate(item) for item in json.loads(p.dependants_details_json)]
        except Exception:
            dep_list = []

    evt_list = []
    if p.planned_events_json:
        try:
            evt_list = [PlannedLifeEvent.model_validate(item) for item in json.loads(p.planned_events_json)]
        except Exception:
            evt_list = []

    return HouseholdProfileResponse(
        is_saved=True,
        id=p.id,
        primary_earner_age=p.primary_earner_age,
        household_type=p.household_type,
        dependants_count=p.dependants_count,
        children_count=p.children_count,
        elderly_dependants_count=p.elderly_dependants_count,
        monthly_family_support=None if p.monthly_family_support is None else Decimal(str(p.monthly_family_support)),
        job_stability=p.job_stability,
        emergency_fund_months_target=p.emergency_fund_months_target,
        dependants_details=dep_list,
        planned_events=evt_list,
        updated_at=p.updated_at.isoformat(),
    )


@router.get("/profile", response_model=HouseholdProfileResponse)
def get_household_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> HouseholdProfileResponse:
    """The household details the current user has provided. Nothing is created or assumed: with no
    saved profile, `is_saved` is false and every detail is null."""
    return _to_profile_response(_find_profile(user, db))


@router.put("/profile", response_model=HouseholdProfileResponse)
def update_household_profile(
    req: HouseholdProfileUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> HouseholdProfileResponse:
    """Save household composition, dependants and family support. Only the fields sent are stored."""
    profile = _find_profile(user, db) or _create_profile(user, db)

    if req.primary_earner_age is not None:
        profile.primary_earner_age = req.primary_earner_age
    if req.household_type is not None:
        profile.household_type = req.household_type
    if req.dependants_count is not None:
        profile.dependants_count = req.dependants_count
    if req.children_count is not None:
        profile.children_count = req.children_count
    if req.elderly_dependants_count is not None:
        profile.elderly_dependants_count = req.elderly_dependants_count
    if req.monthly_family_support is not None:
        profile.monthly_family_support = req.monthly_family_support
    if req.job_stability is not None:
        profile.job_stability = req.job_stability
    if req.emergency_fund_months_target is not None:
        profile.emergency_fund_months_target = req.emergency_fund_months_target
    if req.dependants_details is not None:
        profile.dependants_details_json = json.dumps([d.model_dump(mode="json") for d in req.dependants_details])
    if req.planned_events is not None:
        profile.planned_events_json = json.dumps([e.model_dump(mode="json") for e in req.planned_events])

    profile.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(profile)
    return _to_profile_response(profile)


@router.get("/risk-capacity", response_model=RiskCapacityIndicatorResponse)
def get_risk_capacity(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RiskCapacityIndicatorResponse:
    """Risk capacity from the details the person provided, plus their recorded balances and loans.

    A detail that was not provided is left out of the assessment and said so. With no saved profile
    the level is "Not assessed"."""
    profile = _find_profile(user, db)

    # 1. Total liquid reserves
    liquid_accounts = (
        db.query(FinancialAccount)
        .filter(FinancialAccount.user_id == user.id, FinancialAccount.is_liquid.is_(True))
        .all()
    )
    liquid_reserves = sum((a.balance for a in liquid_accounts), Decimal("0.00"))

    # 2. Monthly fixed commitments (loan EMIs + monthly family support, when provided)
    liabilities = db.query(Liability).filter(Liability.user_id == user.id).all()
    monthly_emis = sum((liab.monthly_emi for liab in liabilities), Decimal("0.00"))
    support = Decimal("0.00")
    if profile is not None and profile.monthly_family_support is not None:
        support = Decimal(str(profile.monthly_family_support))
    monthly_commitments = monthly_emis + support

    # 3. Reserve coverage
    if monthly_commitments > 0:
        coverage = (liquid_reserves / monthly_commitments).quantize(Decimal("0.1"))
    else:
        coverage = Decimal("99.9") if liquid_reserves > 0 else Decimal("0.0")

    target = profile.emergency_fund_months_target if profile is not None else None
    rec_months = target or REFERENCE_RESERVE_MONTHS

    if profile is None:
        return RiskCapacityIndicatorResponse(
            primary_earner_age=None,
            household_type=None,
            dependants_count=None,
            monthly_commitments=monthly_commitments,
            liquid_reserves=liquid_reserves,
            reserve_coverage_months=str(coverage),
            recommended_reserve_months=rec_months,
            risk_capacity_level="Not assessed",
            explanation=[
                "No household details have been saved, so risk capacity is not assessed.",
                f"{REFERENCE_RESERVE_MONTHS} months is shown only as a general reference for reserves.",
            ],
        )

    # 4. Score from what was provided, with a line for what was not
    score = 50  # neutral starting point
    explanations: list[str] = []

    age = profile.primary_earner_age
    if age is None:
        explanations.append("Age was not provided, so it is left out of this assessment.")
    elif age < 35:
        score += 15
        explanations.append(f"Age {age} gives a long career horizon and higher capacity to weather market cycles.")
    elif age <= 50:
        score += 5
        explanations.append(f"Age {age} represents peak earning years with moderate investment horizon.")
    else:
        score -= 15
        explanations.append(f"Age {age} nears retirement horizon, lowering capacity for capital volatility.")

    if profile.household_type is None:
        explanations.append("Household type was not provided, so it is left out of this assessment.")
    elif profile.household_type == "dual_earner":
        score += 15
        explanations.append("Dual-income household provides cashflow redundancy against unexpected income disruption.")
    elif profile.household_type == "retiree":
        score -= 20
        explanations.append("Retiree status implies finite human capital and non-replenishable earned income.")
    else:
        explanations.append("Single-earner household carries concentrated income risk.")

    counts = (profile.dependants_count, profile.children_count, profile.elderly_dependants_count)
    total_dependants: int | None
    if all(value is None for value in counts):
        total_dependants = None
        explanations.append("Dependants were not provided, so they are left out of this assessment.")
    else:
        total_dependants = max(
            profile.dependants_count or 0,
            (profile.children_count or 0) + (profile.elderly_dependants_count or 0),
        )
        if total_dependants == 0:
            score += 10
            explanations.append("No financial dependants allows flexible rebalancing of discretionary expenses.")
        elif total_dependants <= 2:
            score -= 5
            explanations.append(f"Supporting {total_dependants} dependant(s) creates ongoing inelastic household obligations.")
        else:
            score -= 15
            explanations.append(f"High dependant burden ({total_dependants} dependants) necessitates defensive liquidity buffers.")

    if profile.job_stability is None:
        explanations.append("Job stability was not provided, so it is left out of this assessment.")
    elif profile.job_stability == "high":
        score += 10
        explanations.append("High career stability reduces probability of forced asset liquidation.")
    elif profile.job_stability in ("moderate", "variable"):
        score -= 10
        explanations.append("Variable or moderate income certainty warrants higher liquidity reserves.")

    if target is None:
        explanations.append(
            f"No reserve target was set; {REFERENCE_RESERVE_MONTHS} months is used as a general reference."
        )
    if coverage >= Decimal(str(rec_months)):
        score += 10
        explanations.append(f"Liquid reserves cover {coverage} months of commitments (reference: {rec_months} months).")
    else:
        score -= 15
        explanations.append(f"Liquid reserves cover only {coverage} months, below {rec_months} months.")

    provided = [age, profile.household_type, total_dependants, profile.job_stability]
    if all(value is None for value in provided):
        capacity_level = "Not assessed"
    elif score >= 70:
        capacity_level = "High"
    elif score >= 45:
        capacity_level = "Moderate"
    else:
        capacity_level = "Low"

    return RiskCapacityIndicatorResponse(
        primary_earner_age=profile.primary_earner_age,
        household_type=profile.household_type,
        dependants_count=total_dependants,
        monthly_commitments=monthly_commitments,
        liquid_reserves=liquid_reserves,
        reserve_coverage_months=str(coverage),
        recommended_reserve_months=rec_months,
        risk_capacity_level=capacity_level,
        explanation=explanations,
    )
