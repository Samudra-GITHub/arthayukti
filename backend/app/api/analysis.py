"""Calculation endpoints. The contract is frozen in M0; the engine arrives in M1-M3."""

from fastapi import APIRouter

from app.api.common import ERROR_RESPONSES, not_implemented
from app.schemas.requests import (
    CompareRequest,
    FixRequest,
    ProjectionRequest,
    TradeoffRequest,
)
from app.schemas.results import CompareResult, FixResult, ProjectionResult, TradeoffResult

router = APIRouter(tags=["analysis"])


@router.post("/projections", response_model=ProjectionResult, responses=ERROR_RESPONSES)
def create_projection(request: ProjectionRequest) -> ProjectionResult:
    """Baseline, shock and reprioritisation: all are a plan plus an optional scenario."""
    raise not_implemented("Projections")


@router.post("/tradeoffs", response_model=TradeoffResult, responses=ERROR_RESPONSES)
def create_tradeoffs(request: TradeoffRequest) -> TradeoffResult:
    raise not_implemented("The trade-off matrix")


@router.post("/fixes", response_model=FixResult, responses=ERROR_RESPONSES)
def create_fixes(request: FixRequest) -> FixResult:
    raise not_implemented("Minimal fixes")


@router.post("/compare", response_model=CompareResult, responses=ERROR_RESPONSES)
def compare_scenarios(request: CompareRequest) -> CompareResult:
    raise not_implemented("Scenario comparison")
