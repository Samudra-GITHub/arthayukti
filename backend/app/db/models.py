import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


def _gen_uuid() -> str:
    return str(uuid.uuid4())


def _now_utc() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False, default="")
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    plans = relationship("SavedPlan", back_populates="user", cascade="all, delete-orphan")
    policies = relationship("InsurancePolicy", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("FinancialAccount", back_populates="user", cascade="all, delete-orphan")
    investments = relationship(
        "AssetInvestment", back_populates="user", cascade="all, delete-orphan"
    )
    liabilities = relationship("Liability", back_populates="user", cascade="all, delete-orphan")
    household_profile = relationship(
        "HouseholdProfile", uselist=False, back_populates="user", cascade="all, delete-orphan"
    )


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # SHA-256 of the emailed token. The token itself is never stored.
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)


class SavedPlan(Base):
    __tablename__ = "saved_plans"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(255), nullable=False)
    as_of = Column(String(7), nullable=False)  # YYYY-MM
    currency = Column(String(10), default="INR", nullable=False)
    plan_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    user = relationship("User", back_populates="plans")


class CalculationRun(Base):
    __tablename__ = "calculation_runs"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan_id = Column(
        String(36), ForeignKey("saved_plans.id", ondelete="SET NULL"), nullable=True, index=True
    )
    run_type = Column(String(50), nullable=False)  # projection, tradeoffs, rescue, fixes
    inputs_hash = Column(String(64), nullable=False, index=True)
    summary_json = Column(Text, nullable=False)
    assumptions_json = Column(Text, nullable=False)
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)


class FinancialAccount(Base):
    __tablename__ = "financial_accounts"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    account_name = Column(String(255), nullable=False)
    account_type = Column(
        String(50), nullable=False
    )  # savings, checking, fixed_deposit, brokerage, wallet, other
    balance = Column(Numeric(20, 2), nullable=False, default=0)
    currency = Column(String(10), default="INR", nullable=False)
    is_liquid = Column(Boolean, default=True, nullable=False)
    institution_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    user = relationship("User", back_populates="accounts")
    transactions = relationship(
        "FinancialTransaction", back_populates="account", cascade="all, delete-orphan"
    )


class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    account_id = Column(
        String(36),
        ForeignKey("financial_accounts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    transaction_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    amount = Column(Numeric(20, 2), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # credit, debit
    category = Column(String(100), nullable=False, index=True)
    description = Column(String(255), nullable=True)
    is_essential = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)

    account = relationship("FinancialAccount", back_populates="transactions")


class AssetInvestment(Base):
    __tablename__ = "assets_investments"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(
        String(50), nullable=False
    )  # stock, mutual_fund, gold, real_estate, epf, ppf, crypto, other
    symbol = Column(String(50), nullable=True, index=True)
    quantity = Column(Numeric(20, 4), nullable=False, default=1)
    purchase_price = Column(Numeric(20, 2), nullable=False, default=0)
    current_value = Column(Numeric(20, 2), nullable=False, default=0)
    is_liquid = Column(Boolean, default=False, nullable=False)
    last_valuation_date = Column(String(10), nullable=True)  # YYYY-MM-DD
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    user = relationship("User", back_populates="investments")


class Liability(Base):
    __tablename__ = "liabilities"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    liability_name = Column(String(255), nullable=False)
    liability_type = Column(
        String(50), nullable=False
    )  # home_loan, personal_loan, auto_loan, education_loan, credit_card
    principal_amount = Column(Numeric(20, 2), nullable=False, default=0)
    current_balance = Column(Numeric(20, 2), nullable=False, default=0)
    interest_rate = Column(Numeric(9, 6), nullable=False, default=0)
    monthly_emi = Column(Numeric(20, 2), nullable=False, default=0)
    start_date = Column(String(10), nullable=True)
    end_date = Column(String(10), nullable=True)
    remaining_months = Column(Integer, nullable=False, default=12)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    user = relationship("User", back_populates="liabilities")


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    policy_number = Column(String(100), nullable=False, index=True)
    policy_type = Column(
        String(50), nullable=False
    )  # term_life, health, ulip, endowment_money_back, motor, home
    insurer_name = Column(String(255), nullable=False)
    plan_name = Column(String(255), nullable=False)
    start_date = Column(String(10), nullable=False)  # YYYY-MM-DD
    renewal_date = Column(String(10), nullable=True)
    expiry_date = Column(String(10), nullable=True)
    base_sum_assured = Column(Numeric(20, 2), nullable=False)
    current_effective_sum_assured = Column(Numeric(20, 2), nullable=False)
    premium_amount = Column(Numeric(20, 2), nullable=False)
    premium_frequency = Column(
        String(20), default="annual", nullable=False
    )  # annual, monthly, quarterly
    status = Column(String(20), default="active", nullable=False)  # active, lapsed, expired
    policy_details_json = Column(
        Text, nullable=True
    )  # JSON: members, assets, nominee, restoration, NCB, IDV, etc.
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    user = relationship("User", back_populates="policies")
    escalations = relationship(
        "CoverageEscalation", back_populates="policy", cascade="all, delete-orphan"
    )
    history = relationship(
        "CoverageEscalationHistory", back_populates="policy", cascade="all, delete-orphan"
    )
    reminders = relationship(
        "InsuranceReminder", back_populates="policy", cascade="all, delete-orphan"
    )


class CoverageEscalation(Base):
    __tablename__ = "coverage_escalations"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    policy_id = Column(
        String(36),
        ForeignKey("insurance_policies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    escalation_type = Column(
        String(50), nullable=False
    )  # none, fixed_percentage, fixed_amount, step_up, inflation_linked, life_event_enhancement, bonus_accrual
    base_sum_assured = Column(Numeric(20, 2), nullable=False)
    current_effective_sum_assured = Column(Numeric(20, 2), nullable=False)
    escalation_rate = Column(Numeric(9, 6), nullable=True)
    fixed_escalation_amount = Column(Numeric(20, 2), nullable=True)
    escalation_frequency = Column(
        String(50), nullable=False
    )  # annual, every_5_years, policy_anniversary, custom
    custom_interval_months = Column(Integer, nullable=True)
    first_escalation_date = Column(String(10), nullable=True)
    next_escalation_date = Column(String(10), nullable=True, index=True)
    maximum_total_cover = Column(Numeric(20, 2), nullable=True)
    maximum_increase_percentage = Column(Numeric(9, 6), nullable=True)
    maximum_cover_multiple = Column(Numeric(12, 6), nullable=True)
    premium_increases_with_cover = Column(Boolean, default=False, nullable=False)
    premium_change_rule = Column(Text, nullable=True)
    medical_underwriting_required = Column(Boolean, default=False, nullable=False)
    age_limit = Column(Integer, nullable=True)
    escalation_status = Column(
        String(20), default="active", nullable=False
    )  # active, completed, stopped, cancelled
    escalation_terms = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    policy = relationship("InsurancePolicy", back_populates="escalations")
    history = relationship(
        "CoverageEscalationHistory", back_populates="escalation", cascade="all, delete-orphan"
    )


class CoverageEscalationHistory(Base):
    __tablename__ = "coverage_escalation_history"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    escalation_id = Column(
        String(36),
        ForeignKey("coverage_escalations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    policy_id = Column(
        String(36),
        ForeignKey("insurance_policies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    effective_date = Column(String(10), nullable=False)
    event_type = Column(String(50), nullable=False)
    prior_cover = Column(Numeric(20, 2), nullable=False)
    increase_amount = Column(Numeric(20, 2), nullable=False)
    resulting_cover = Column(Numeric(20, 2), nullable=False)
    premium_before = Column(Numeric(20, 2), nullable=True)
    premium_after = Column(Numeric(20, 2), nullable=True)
    underwriting_requirement = Column(String(255), nullable=True)
    source = Column(String(50), default="system", nullable=False)
    supporting_document = Column(String(255), nullable=True)
    calculation_version = Column(String(20), default="v1.0", nullable=False)
    notes = Column(Text, nullable=True)
    idempotency_key = Column(String(128), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)

    __table_args__ = (
        UniqueConstraint("escalation_id", "idempotency_key", name="uq_escalation_idempotency_key"),
    )

    escalation = relationship("CoverageEscalation", back_populates="history")
    policy = relationship("InsurancePolicy", back_populates="history")


class InsuranceReminder(Base):
    __tablename__ = "insurance_reminders"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    policy_id = Column(
        String(36),
        ForeignKey("insurance_policies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reminder_type = Column(String(50), nullable=False)
    due_date = Column(String(10), nullable=False, index=True)
    message = Column(Text, nullable=False)
    is_acknowledged = Column(Boolean, default=False, nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)

    policy = relationship("InsurancePolicy", back_populates="reminders")


class MarketDataSnapshot(Base):
    __tablename__ = "market_data_snapshots"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    symbol = Column(String(50), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)
    price = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    source = Column(String(100), nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    is_stale = Column(Boolean, default=False, nullable=False)
    metadata_json = Column(Text, nullable=True)


class HouseholdProfile(Base):
    __tablename__ = "household_profiles"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    primary_earner_age = Column(Integer, nullable=True)
    # Every detail is NULL until the person provides it: nothing here is a default presented as a fact.
    household_type = Column(String(50), nullable=True)  # single_earner, dual_earner, retiree
    dependants_count = Column(Integer, nullable=True)
    children_count = Column(Integer, nullable=True)
    elderly_dependants_count = Column(Integer, nullable=True)
    monthly_family_support = Column(Numeric(20, 2), nullable=True)
    job_stability = Column(String(50), nullable=True)  # high, stable, moderate, variable
    emergency_fund_months_target = Column(Integer, nullable=True)
    dependants_details_json = Column(Text, nullable=True)
    planned_events_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now_utc, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )

    user = relationship("User", back_populates="household_profile")
