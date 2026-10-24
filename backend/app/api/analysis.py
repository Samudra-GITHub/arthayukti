"""Calculation endpoints. Projections are live; the rest follow in M3-M4."""

from fastapi import APIRouter

from app.api.common import ERROR_RESPONSES, VALIDATION_RESPONSES, not_implemented
from app.engine.projection import project
from app.errors import ApiError
from app.schemas.requests import (
    CompareRequest,
    FixRequest,
    ProjectionRequest,
    TradeoffRequest,
)
from app.schemas.results import CompareResult, FixResult, ProjectionResult, TradeoffResult

router = APIRouter(tags=["analysis"])


@router.post("/projections", response_model=ProjectionResult, responses=VALIDATION_RESPONSES)
def create_projection(request: ProjectionRequest) -> ProjectionResult:
    """Baseline, shock and reprioritisation: all are a plan plus an optional scenario."""
    try:
        return project(request.plan, request.scenario, request.include_monthly)
    except ValueError as error:
        raise ApiError(422, "scenario_invalid", str(error)) from error


@router.post("/tradeoffs", response_model=TradeoffResult, responses=ERROR_RESPONSES)
def create_tradeoffs(request: TradeoffRequest) -> TradeoffResult:
    raise not_implemented("The trade-off matrix")


@router.post("/fixes", response_model=FixResult, responses=ERROR_RESPONSES)
def create_fixes(request: FixRequest) -> FixResult:
    raise not_implemented("Minimal fixes")


@router.post("/compare", response_model=CompareResult, responses=ERROR_RESPONSES)
def compare_scenarios(request: CompareRequest) -> CompareResult:
    raise not_implemented("Scenario comparison")
