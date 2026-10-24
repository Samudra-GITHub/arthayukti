import hashlib
import logging
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app import mail, ratelimit
from app.api.common import AUTH_RESPONSES
from app.api.deps import get_current_user, get_db
from app.config import settings
from app.db.models import (
    AuditLog,
    FinancialAccount,
    InsurancePolicy,
    PasswordReset,
    SavedPlan,
    User,
)
from app.schemas.auth import (
    AuthResponse,
    ExportAccount,
    ExportPlan,
    ExportPolicy,
    ExportResponse,
    ExportUser,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    SignupRequest,
    UserProfile,
)
from app.security import (
    create_access_token,
    hash_password,
    verify_password,
)

logger = logging.getLogger("arthayukti")

router = APIRouter(prefix="/auth", tags=["auth"], responses=AUTH_RESPONSES)

LOGIN_WINDOW = 15 * 60
SIGNUP_WINDOW = 60 * 60
RESET_WINDOW = 60 * 60


@lru_cache(maxsize=1)
def _dummy_hash() -> str:
    """A real bcrypt hash checked when the e-mail is unknown, so timing does not reveal it."""
    return hash_password(secrets.token_urlsafe(16))


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _as_utc(value: datetime) -> datetime:
    """SQLite returns naive datetimes. Everything stored here is UTC, so label it as such."""
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _profile(user: User) -> UserProfile:
    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    """Register a new user account with secure password hashing."""
    ratelimit.enforce(request, "signup", 10, SIGNUP_WINDOW)
    if db.query(User).filter(User.email == req.email).first():
        # Deliberately vague. Fully hiding whether an address is registered needs e-mail
        # verification, which does not exist yet.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="We could not create an account with these details.",
        )

    user = User(
        id=str(uuid.uuid4()),
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    db.add(
        AuditLog(user_id=user.id, action="USER_SIGNUP", resource_type="USER", resource_id=user.id)
    )
    db.commit()

    return AuthResponse(access_token=create_access_token(user.id, user.email), user=_profile(user))


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    """Authenticate with email and password and receive a signed JWT."""
    ratelimit.enforce(request, "login-address", 60, LOGIN_WINDOW)
    ratelimit.enforce(request, "login", 10, LOGIN_WINDOW, req.email)
    user = db.query(User).filter(User.email == req.email).first()
    password_ok = verify_password(req.password, user.hashed_password if user else _dummy_hash())
    if not user or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")

    db.add(
        AuditLog(user_id=user.id, action="USER_LOGIN", resource_type="USER", resource_id=user.id)
    )
    db.commit()

    return AuthResponse(access_token=create_access_token(user.id, user.email), user=_profile(user))


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)) -> MessageResponse:
    """End the session on the client. Tokens are stateless, so they expire on their own."""
    return MessageResponse(message="Successfully logged out.")


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(current_user: User = Depends(get_current_user)) -> UserProfile:
    """Fetch profile of current authenticated user."""
    return _profile(current_user)


@router.post("/password-reset/request", response_model=MessageResponse)
def request_password_reset(
    req: PasswordResetRequest, request: Request, db: Session = Depends(get_db)
) -> MessageResponse:
    """E-mail a single-use reset link. Unavailable until a mail transport is configured."""
    if not mail.mail_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Password reset by e-mail is not available yet.",
        )
    ratelimit.enforce(request, "reset-request-address", 20, RESET_WINDOW)
    ratelimit.enforce(request, "reset-request", 5, RESET_WINDOW, req.email)
    user = db.query(User).filter(User.email == req.email, User.is_active.is_(True)).first()
    if user:
        token = secrets.token_urlsafe(32)
        db.add(
            PasswordReset(
                user_id=user.id,
                token_hash=_hash_token(token),
                expires_at=datetime.now(UTC)
                + timedelta(minutes=settings.PASSWORD_RESET_TTL_MINUTES),
                used=False,
            )
        )
        db.commit()
        try:
            mail.send_password_reset(user.email, token)
        except Exception as error:
            # Same answer as for an unknown address, so an outage does not reveal who is
            # registered. The token was never delivered, so it is retired at once. Only the
            # error type is logged: never the token or the address.
            logger.warning("Password reset e-mail not sent (%s).", type(error).__name__)
            for pending in (
                db.query(PasswordReset)
                .filter(PasswordReset.user_id == user.id, PasswordReset.used.is_(False))
                .all()
            ):
                pending.used = True
            db.commit()
    # The same answer whether or not the address is registered.
    return MessageResponse(
        message="If that address is registered, a reset link has been sent to it."
    )


@router.post("/password-reset/confirm", response_model=MessageResponse)
def confirm_password_reset(
    req: PasswordResetConfirm, request: Request, db: Session = Depends(get_db)
) -> MessageResponse:
    """Set a new password with a valid, unused, unexpired reset token."""
    ratelimit.enforce(request, "reset-confirm", 20, RESET_WINDOW)
    reset = (
        db.query(PasswordReset)
        .filter(PasswordReset.token_hash == _hash_token(req.token), PasswordReset.used.is_(False))
        .first()
    )
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Reset token is invalid or has expired.",
    )
    if reset is None or _as_utc(reset.expires_at) < datetime.now(UTC):
        raise invalid

    user = db.query(User).filter(User.id == reset.user_id, User.is_active.is_(True)).first()
    if user is None:
        raise invalid

    user.hashed_password = hash_password(req.new_password)
    # One use only, and any other outstanding link for this account stops working too.
    for other in (
        db.query(PasswordReset)
        .filter(PasswordReset.user_id == user.id, PasswordReset.used.is_(False))
        .all()
    ):
        other.used = True
    db.add(
        AuditLog(
            user_id=user.id, action="PASSWORD_RESET", resource_type="USER", resource_id=user.id
        )
    )
    db.commit()

    return MessageResponse(message="Password has been reset successfully.")


@router.get("/export-data", response_model=ExportResponse)
def export_user_data(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ExportResponse:
    """Export of the personal data held for the signed-in user."""
    plans = db.query(SavedPlan).filter(SavedPlan.user_id == current_user.id).all()
    accounts = db.query(FinancialAccount).filter(FinancialAccount.user_id == current_user.id).all()
    policies = db.query(InsurancePolicy).filter(InsurancePolicy.user_id == current_user.id).all()
    return ExportResponse(
        user=ExportUser(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            created_at=current_user.created_at.isoformat(),
        ),
        plans=[ExportPlan(id=p.id, name=p.name, as_of=p.as_of) for p in plans],
        accounts=[
            ExportAccount(id=a.id, name=a.account_name, type=a.account_type, balance=str(a.balance))
            for a in accounts
        ],
        policies=[
            ExportPolicy(id=p.id, number=p.policy_number, type=p.policy_type) for p in policies
        ],
    )


@router.delete("/delete-account", response_model=MessageResponse)
def delete_account(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> MessageResponse:
    """Completely wipe user account and all associated tenant data."""
    db.delete(current_user)
    db.commit()
    return MessageResponse(message="Account and all personal records permanently deleted.")
