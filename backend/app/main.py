import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analysis, health, plans, samples
from app.errors import register_error_handlers

DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def create_app() -> FastAPI:
    app = FastAPI(
        title="ArthaYukti API",
        version="0.1.0",
        description="Multi-goal financial planning. Illustrative decision support, not advice.",
    )
    origins = os.environ.get("ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in origins if origin.strip()],
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=["Content-Type"],
    )
    register_error_handlers(app)
    for module in (health, samples, analysis, plans):
        app.include_router(module.router, prefix="/api/v1")
    return app


app = create_app()
