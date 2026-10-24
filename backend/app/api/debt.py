from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.common import AUTH_RESPONSES
from app.api.deps import get_current_user, get_db
from app.db.models import Liability, User
from app.engine.debt import calculate_amortization_schedule, compare_payoff_strategies
from app.schemas.debt import (
    AmortizationRequest,
    AmortizationResponse,
    StrategyComparisonRequest,
    StrategyComparisonResponse,
)

router = APIRouter(prefix="/debt", tags=["debt"], responses=AUTH_RESPONSES)


@router.post("/amortize", response_model=AmortizationResponse)
def calculate_amortization(req: AmortizationRequest) -> AmortizationResponse:
    """Calculate complete loan amortization schedule with prepayment acceleration and interest savings."""
    res = calculate_amortization_schedule(
        principal=req.principal,
        annual_rate=req.annual_interest_rate,
        tenure_months=req.tenure_months,
        monthly_emi=req.monthly_emi,
        extra_monthly_payment=req.extra_monthly_payment,
    )
    return AmortizationResponse.model_validate(res)


@router.post("/compare-strategies", response_model=StrategyComparisonResponse)
def compare_strategies(
    req: StrategyComparisonRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StrategyComparisonResponse:
    """Compare Debt Avalanche (highest interest first) vs Debt Snowball (lowest balance first).
    
    If `debts` is omitted or empty, the caller's active liabilities from their profile are used.
    """
    owner = user
    debt_items: list[dict[str, Any]] = []

    if req.debts and len(req.debts) > 0:
        debt_items = [
            {
                "id": d.id,
                "name": d.name,
                "balance": d.balance,
                "interest_rate": d.interest_rate,
                "monthly_emi": d.monthly_emi,
            }
            for d in req.debts
        ]
    else:
        # Load from stored liabilities
        liabilities = (
            db.query(Liability)
            .filter(Liability.user_id == owner.id, Liability.current_balance > 0)
            .all()
        )
        debt_items = [
            {
                "id": liab.id,
                "name": liab.liability_name,
                "balance": liab.current_balance,
                "interest_rate": liab.interest_rate,
                "monthly_emi": liab.monthly_emi,
            }
            for liab in liabilities
        ]

    comparison = compare_payoff_strategies(debt_items, req.extra_monthly_budget)
    return StrategyComparisonResponse.model_validate(comparison)


@router.get("/strategies", response_model=StrategyComparisonResponse)
def get_user_debt_strategies(
    extra_budget: Decimal = Query(default=Decimal("0.00"), ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StrategyComparisonResponse:
    """Run Avalanche vs Snowball debt payoff analysis on the current user's recorded liabilities."""
    owner = user
    liabilities = (
        db.query(Liability)
        .filter(Liability.user_id == owner.id, Liability.current_balance > 0)
        .all()
    )
    debt_items = [
        {
            "id": liab.id,
            "name": liab.liability_name,
            "balance": liab.current_balance,
            "interest_rate": liab.interest_rate,
            "monthly_emi": liab.monthly_emi,
        }
        for liab in liabilities
    ]
    comparison = compare_payoff_strategies(debt_items, extra_budget)
    return StrategyComparisonResponse.model_validate(comparison)
