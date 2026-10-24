"""Planned income projection (year by year) and its CSV export.

Both are built by engine.income.project_income, the same monthly income the surplus, goals and
scenarios use. Planned income is never read from actual transactions.
"""

import csv
import io
from decimal import Decimal

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.common import AUTH_RESPONSES, VALIDATION_RESPONSES
from app.api.deps import get_current_user, get_db
from app.db.models import SavedPlan, User
from app.engine.income import project_income
from app.errors import ApiError
from app.schemas.income import IncomeProjectionRequest, IncomeProjectionResponse, IncomeYear
from app.schemas.plan import Plan

router = APIRouter(prefix="/income", tags=["income"], responses=AUTH_RESPONSES)


def _load(req: IncomeProjectionRequest, db: Session, user: User) -> tuple[Plan, str]:
    if req.plan_id is not None:
        record = db.query(SavedPlan).filter(SavedPlan.id == req.plan_id, SavedPlan.user_id == user.id).first()
        if record is None:
            raise ApiError(404, "not_found", "Plan not found.")
        return Plan.model_validate_json(record.plan_json), "saved"
    assert req.plan is not None
    return req.plan, "hypothetical"


def _build(req: IncomeProjectionRequest, db: Session, user: User) -> IncomeProjectionResponse:
    plan, source = _load(req, db, user)
    rows = project_income(plan, req.horizon_months)
    years = [IncomeYear.model_validate(row) for row in rows]
    total = years[-1].cumulative_income if years else Decimal("0.00")
    return IncomeProjectionResponse(
        plan_source=source,
        horizon_months=req.horizon_months,
        first_month=plan.as_of,
        total_projected_income=total,
        years=years,
    )


@router.post("/projection", response_model=IncomeProjectionResponse, responses=VALIDATION_RESPONSES)
def income_projection(
    req: IncomeProjectionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> IncomeProjectionResponse:
    """Annual and cumulative planned income by calendar year for the first `horizon_months` months."""
    return _build(req, db, user)


@router.post("/projection/csv", responses=VALIDATION_RESPONSES, response_class=Response)
def income_projection_csv(
    req: IncomeProjectionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    """The same projection as CSV: UTF-8 with a byte-order mark so Excel opens it with the right columns."""
    result = _build(req, db, user)
    out = io.StringIO()
    writer = csv.writer(out, lineterminator="\r\n")
    writer.writerow(["Year", "Annual projected income", "Cumulative projected income"])
    for row in result.years:
        writer.writerow([row.year, f"{row.annual_income:.2f}", f"{row.cumulative_income:.2f}"])
    return Response(
        content="\ufeff" + out.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="arthayukti_income_projection.csv"'},
    )
