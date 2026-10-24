"""Saved plans. The contract is frozen in M0; storage arrives in M3."""

from fastapi import APIRouter

from app.api.common import ERROR_RESPONSES, not_implemented
from app.schemas.plan import Plan
from app.schemas.requests import PlanRecord, PlanSummary

router = APIRouter(tags=["plans"])


@router.post("/plans", response_model=PlanRecord, status_code=201, responses=ERROR_RESPONSES)
def create_plan(plan: Plan) -> PlanRecord:
    raise not_implemented("Saving plans")


@router.get("/plans", response_model=list[PlanSummary], responses=ERROR_RESPONSES)
def list_plans() -> list[PlanSummary]:
    raise not_implemented("Listing plans")


@router.get("/plans/{plan_id}", response_model=PlanRecord, responses=ERROR_RESPONSES)
def get_plan(plan_id: str) -> PlanRecord:
    raise not_implemented("Loading plans")


@router.put("/plans/{plan_id}", response_model=PlanRecord, responses=ERROR_RESPONSES)
def update_plan(plan_id: str, plan: Plan) -> PlanRecord:
    raise not_implemented("Editing plans")
