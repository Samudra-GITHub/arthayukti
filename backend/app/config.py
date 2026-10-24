import logging
import secrets
from pathlib import Path
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]

logger = logging.getLogger("arthayukti")

# Environments where a missing signing secret is replaced by a throwaway one. Anything else
# (production, staging, ...) refuses to start without a strong secret.
LENIENT_ENVIRONMENTS = {"development", "test"}
MIN_SECRET_LENGTH = 32
# Values that have appeared in this repository and must never sign real tokens.
KNOWN_PLACEHOLDER_SECRETS = {
    "arthayukti-super-secret-production-grade-key-2026-minimum-32-chars",
    "change-this-in-production-to-a-secure-random-key-at-least-32-characters",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./arthayukti.db"
    # No default: see _require_signing_secret. Generate with `openssl rand -hex 32`.
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Demo account: only ever created in development, and only when asked for explicitly.
    SEED_DEMO_USER: bool = False
    DEMO_USER_PASSWORD: str = ""

    # Abuse limits
    RATE_LIMIT_ENABLED: bool = True
    MAX_REQUEST_BYTES: int = 2_000_000

    # Password reset delivery: "disabled" until a real mail transport is configured.
    MAIL_BACKEND: Literal["disabled", "smtp", "memory"] = "disabled"
    MAIL_FROM: str = "no-reply@arthayukti.invalid"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    FRONTEND_BASE_URL: str = "http://localhost:5173"
    PASSWORD_RESET_TTL_MINUTES: int = 60

    # Financial Engine Settings
    DEFAULT_GOAL_INFLATION: str = "0.05"
    MODEL_VERSION: str = "v1.3-constraint-aware"

    @model_validator(mode="after")
    def _require_signing_secret(self) -> "Settings":
        weak = (
            len(self.SECRET_KEY) < MIN_SECRET_LENGTH or self.SECRET_KEY in KNOWN_PLACEHOLDER_SECRETS
        )
        if not weak:
            return self
        if self.ENVIRONMENT in LENIENT_ENVIRONMENTS:
            # Sessions do not survive a restart in this mode. That is intended for local work.
            self.SECRET_KEY = secrets.token_urlsafe(48)
            logger.warning(
                "SECRET_KEY is not set (or is a placeholder): using a temporary key. "
                "Sign-ins end when the server restarts."
            )
            return self
        raise ValueError(
            "SECRET_KEY must be set to a random value of at least "
            f"{MIN_SECRET_LENGTH} characters when ENVIRONMENT={self.ENVIRONMENT!r}."
        )


settings = Settings()
