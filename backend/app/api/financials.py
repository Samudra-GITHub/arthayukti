import csv
import io
import itertools
import uuid
from datetime import date
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.api.common import AUTH_RESPONSES
from app.api.deps import get_current_user, get_db
from app.db.models import (
    AssetInvestment,
    FinancialAccount,
    FinancialTransaction,
    Liability,
    User,
)
from app.errors import ApiError
from app.schemas.financials import (
    AccountCreateRequest,
    AccountResponse,
    CSVImportResponse,
    InvestmentCreateRequest,
    InvestmentResponse,
    LiabilityCreateRequest,
    LiabilityResponse,
    NetWorthResponse,
    TransactionCreateRequest,
    TransactionResponse,
)
from app.schemas.types import MAX_MONEY

router = APIRouter(prefix="/financials", tags=["financials"], responses=AUTH_RESPONSES)


# =========================================================================
# Accounts
# =========================================================================


@router.post("/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    req: AccountCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AccountResponse:
    """Create a new financial account (savings, checking, deposit, brokerage, etc.)."""
    owner = user
    acc = FinancialAccount(
        id=str(uuid.uuid4()),
        user_id=owner.id,
        account_name=req.account_name,
        account_type=req.account_type,
        balance=req.balance,
        currency=req.currency,
        is_liquid=req.is_liquid,
        institution_name=req.institution_name,
        notes=req.notes,
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return _to_account_response(acc)


@router.get("/accounts", response_model=list[AccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[AccountResponse]:
    """List all accounts for the current user."""
    owner = user
    accounts = (
        db.query(FinancialAccount)
        .filter(FinancialAccount.user_id == owner.id)
        .order_by(FinancialAccount.created_at.desc())
        .all()
    )
    return [_to_account_response(a) for a in accounts]


# =========================================================================
# Transactions & CSV Import
# =========================================================================


@router.post(
    "/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED
)
def create_transaction(
    req: TransactionCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TransactionResponse:
    """Create an individual income/expense transaction."""
    owner = user
    tx = FinancialTransaction(
        id=str(uuid.uuid4()),
        user_id=owner.id,
        account_id=req.account_id,
        transaction_date=req.transaction_date,
        amount=req.amount,
        transaction_type=req.transaction_type,
        category=req.category,
        description=req.description,
        is_essential=req.is_essential,
    )
    db.add(tx)

    # Adjust account balance if linked
    if req.account_id:
        acc = (
            db.query(FinancialAccount)
            .filter(FinancialAccount.id == req.account_id, FinancialAccount.user_id == owner.id)
            .first()
        )
        if acc:
            if req.transaction_type == "credit":
                acc.balance += req.amount
            else:
                acc.balance -= req.amount

    db.commit()
    db.refresh(tx)
    return _to_tx_response(tx)


@router.get("/transactions", response_model=list[TransactionResponse])
def list_transactions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[TransactionResponse]:
    """List transactions for the current user."""
    owner = user
    txs = (
        db.query(FinancialTransaction)
        .filter(FinancialTransaction.user_id == owner.id)
        .order_by(FinancialTransaction.transaction_date.desc())
        .all()
    )
    return [_to_tx_response(t) for t in txs]


MAX_IMPORT_BYTES = 1_000_000
MAX_IMPORT_ROWS = 5_000
MAX_ERRORS_REPORTED = 50
_TRUE_VALUES = {"true", "1", "yes"}
_FALSE_VALUES = {"false", "0", "no", ""}


def _parse_import_row(row: dict[str, str]) -> tuple[FinancialTransaction | None, str | None]:
    """Validate one CSV row. Returns the transaction, or a message saying what is wrong."""
    date_text = (row.get("date") or row.get("transaction_date") or "").strip()
    try:
        transaction_date = date.fromisoformat(date_text).isoformat()
    except ValueError:
        return None, "date must be a real date written YYYY-MM-DD"

    amount_text = (row.get("amount") or "").replace(",", "").strip()
    try:
        amount = Decimal(amount_text)
    except InvalidOperation:
        return None, "amount is not a number"
    if not amount.is_finite():
        return None, "amount must be a finite number"
    if amount <= 0:
        return None, "amount must be greater than zero (use type credit or debit for direction)"
    if amount > MAX_MONEY:
        return None, "amount is larger than the supported maximum"
    if amount.as_tuple().exponent < -2:
        return None, "amount can have at most 2 decimal places"

    kind = (row.get("type") or "").strip().lower()
    if kind not in ("credit", "debit"):
        return None, "type must be credit or debit"

    essential_text = (row.get("is_essential") or row.get("essential") or "").strip().lower()
    if essential_text not in _TRUE_VALUES | _FALSE_VALUES:
        return None, "is_essential must be true or false"

    category = (row.get("category") or "General").strip()[:120] or "General"
    description = (row.get("description") or "").strip()[:1000]
    return (
        FinancialTransaction(
            id=str(uuid.uuid4()),
            transaction_date=transaction_date,
            amount=amount,
            transaction_type=kind,
            category=category,
            description=description,
            is_essential=essential_text in _TRUE_VALUES,
        ),
        None,
    )


@router.post("/transactions/import", response_model=CSVImportResponse)
async def import_transactions_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CSVImportResponse:
    """Import transactions from a CSV file. Rows that fail validation or repeat an existing
    transaction are skipped and reported; nothing invalid is stored or silently corrected."""
    content = await file.read(MAX_IMPORT_BYTES + 1)
    if len(content) > MAX_IMPORT_BYTES:
        raise ApiError(
            413, "file_too_large", f"The file must be under {MAX_IMPORT_BYTES // 1000} KB."
        )
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise ApiError(422, "invalid_encoding", "The file must be UTF-8 text.") from error

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        raise ApiError(422, "invalid_csv", "The file has no header row.")
    reader.fieldnames = [name.strip().lower() for name in reader.fieldnames]
    if "amount" not in reader.fieldnames or not {"date", "transaction_date"} & set(
        reader.fieldnames
    ):
        raise ApiError(422, "invalid_csv", "The header row must include date and amount columns.")

    rows = list(itertools.islice(reader, MAX_IMPORT_ROWS + 1))
    if len(rows) > MAX_IMPORT_ROWS:
        raise ApiError(422, "too_many_rows", f"The file can have at most {MAX_IMPORT_ROWS} rows.")

    def signature(t: FinancialTransaction) -> tuple:
        return (t.transaction_date, t.amount, t.transaction_type, t.category, t.description)

    seen = {
        (r.transaction_date, r.amount, r.transaction_type, r.category, r.description or "")
        for r in db.query(
            FinancialTransaction.transaction_date,
            FinancialTransaction.amount,
            FinancialTransaction.transaction_type,
            FinancialTransaction.category,
            FinancialTransaction.description,
        ).filter(FinancialTransaction.user_id == user.id)
    }

    imported = failed = duplicates = 0
    errors: list[str] = []
    for line_number, row in enumerate(rows, start=2):
        transaction, problem = _parse_import_row({k: v for k, v in row.items() if k})
        if transaction is None:
            failed += 1
            errors.append(f"Row {line_number}: {problem}")
            continue
        key = signature(transaction)
        if key in seen:
            duplicates += 1
            continue
        seen.add(key)
        transaction.user_id = user.id
        db.add(transaction)
        imported += 1

    db.commit()
    return CSVImportResponse(
        imported_count=imported,
        failed_count=failed,
        duplicate_count=duplicates,
        errors=errors[:MAX_ERRORS_REPORTED],
        errors_truncated=len(errors) > MAX_ERRORS_REPORTED,
    )


# =========================================================================
# Assets & Investments
# =========================================================================


@router.post("/investments", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(
    req: InvestmentCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> InvestmentResponse:
    """Record an asset or investment (stocks, mutual funds, gold, EPF, etc.)."""
    owner = user
    inv = AssetInvestment(
        id=str(uuid.uuid4()),
        user_id=owner.id,
        asset_name=req.asset_name,
        asset_type=req.asset_type,
        symbol=req.symbol,
        quantity=Decimal(str(req.quantity)),
        purchase_price=req.purchase_price,
        current_value=req.current_value,
        is_liquid=req.is_liquid,
        last_valuation_date=req.last_valuation_date,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return _to_inv_response(inv)


@router.get("/investments", response_model=list[InvestmentResponse])
def list_investments(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[InvestmentResponse]:
    """List all assets and investments for the user."""
    owner = user
    items = (
        db.query(AssetInvestment)
        .filter(AssetInvestment.user_id == owner.id)
        .order_by(AssetInvestment.created_at.desc())
        .all()
    )
    return [_to_inv_response(i) for i in items]


# =========================================================================
# Liabilities
# =========================================================================


@router.post("/liabilities", response_model=LiabilityResponse, status_code=status.HTTP_201_CREATED)
def create_liability(
    req: LiabilityCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> LiabilityResponse:
    """Record a loan, mortgage or credit liability."""
    owner = user
    liab = Liability(
        id=str(uuid.uuid4()),
        user_id=owner.id,
        liability_name=req.liability_name,
        liability_type=req.liability_type,
        principal_amount=req.principal_amount,
        current_balance=req.current_balance,
        interest_rate=req.interest_rate,
        monthly_emi=req.monthly_emi,
        remaining_months=req.remaining_months,
        start_date=req.start_date,
        end_date=req.end_date,
    )
    db.add(liab)
    db.commit()
    db.refresh(liab)
    return _to_liab_response(liab)


@router.get("/liabilities", response_model=list[LiabilityResponse])
def list_liabilities(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[LiabilityResponse]:
    """List all liabilities for the user."""
    owner = user
    items = (
        db.query(Liability)
        .filter(Liability.user_id == owner.id)
        .order_by(Liability.created_at.desc())
        .all()
    )
    return [_to_liab_response(liab) for liab in items]


# =========================================================================
# Net Worth
# =========================================================================


@router.get("/net-worth", response_model=NetWorthResponse)
def get_net_worth(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> NetWorthResponse:
    """Calculate comprehensive personal net worth with liquid and illiquid breakdowns."""
    owner = user
    accounts = db.query(FinancialAccount).filter(FinancialAccount.user_id == owner.id).all()
    investments = db.query(AssetInvestment).filter(AssetInvestment.user_id == owner.id).all()
    liabilities = db.query(Liability).filter(Liability.user_id == owner.id).all()

    liquid_accounts = sum((a.balance for a in accounts if a.is_liquid), Decimal("0.00"))
    illiquid_accounts = sum((a.balance for a in accounts if not a.is_liquid), Decimal("0.00"))

    liquid_investments = sum((i.current_value for i in investments if i.is_liquid), Decimal("0.00"))
    illiquid_investments = sum(
        (i.current_value for i in investments if not i.is_liquid), Decimal("0.00")
    )

    total_liquid = liquid_accounts + liquid_investments
    total_illiquid = illiquid_accounts + illiquid_investments
    total_assets = total_liquid + total_illiquid
    total_liabilities = sum((liab.current_balance for liab in liabilities), Decimal("0.00"))
    net_worth = total_assets - total_liabilities

    return NetWorthResponse(
        total_assets=total_assets,
        liquid_assets=total_liquid,
        illiquid_assets=total_illiquid,
        total_liabilities=total_liabilities,
        net_worth=net_worth,
    )


# =========================================================================
# Helpers
# =========================================================================


def _to_account_response(a: FinancialAccount) -> AccountResponse:
    return AccountResponse(
        id=a.id,
        account_name=a.account_name,
        account_type=a.account_type,
        balance=a.balance,
        currency=a.currency,
        is_liquid=a.is_liquid,
        institution_name=a.institution_name,
        notes=a.notes,
        created_at=a.created_at.isoformat(),
    )


def _to_tx_response(t: FinancialTransaction) -> TransactionResponse:
    return TransactionResponse(
        id=t.id,
        account_id=t.account_id,
        transaction_date=t.transaction_date,
        amount=t.amount,
        transaction_type=t.transaction_type,
        category=t.category,
        description=t.description,
        is_essential=t.is_essential,
        created_at=t.created_at.isoformat(),
    )


def _to_inv_response(i: AssetInvestment) -> InvestmentResponse:
    return InvestmentResponse(
        id=i.id,
        asset_name=i.asset_name,
        asset_type=i.asset_type,
        symbol=i.symbol,
        quantity=i.quantity,
        purchase_price=i.purchase_price,
        current_value=i.current_value,
        is_liquid=i.is_liquid,
        last_valuation_date=i.last_valuation_date,
        created_at=i.created_at.isoformat(),
    )


def _to_liab_response(liab: Liability) -> LiabilityResponse:
    return LiabilityResponse(
        id=liab.id,
        liability_name=liab.liability_name,
        liability_type=liab.liability_type,
        principal_amount=liab.principal_amount,
        current_balance=liab.current_balance,
        interest_rate=liab.interest_rate,
        monthly_emi=liab.monthly_emi,
        remaining_months=liab.remaining_months,
        created_at=liab.created_at.isoformat(),
    )
