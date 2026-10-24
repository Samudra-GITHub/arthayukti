from fastapi import APIRouter

from app.schemas.types import ApiModel

router = APIRouter(tags=["health"])


class HealthResponse(ApiModel):
    status: str


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")
