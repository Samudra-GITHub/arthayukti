from typing import Literal

from pydantic import Field

from app.schemas.types import (
    Amount,
    ApiModel,
    DecimalStr,
    IsoDate,
    LongText,
    Money,
    OptionalShortText,
    Rate,
    ShortText,
)

AccountType = Literal["savings", "checking", "fixed_deposit", "brokerage", "wallet", "other"]
AssetType = Literal["stock", "mutual_fund", "gold", "real_estate", "epf", "ppf", "crypto", "other"]
LiabilityType = Literal[
    "home_loan", "personal_loan", "auto_loan", "education_loan", "credit_card", "other"
]


class AccountCreateRequest(ApiModel):
    account_name: ShortText
    account_type: AccountType
    balance: Money
    currency: Literal["INR"] = "INR"
    is_liquid: bool = True
    institution_name: OptionalShortText | None = None
    notes: LongText | None = None


class AccountResponse(ApiModel):
    id: str
    account_name: str
    account_type: str
    balance: Amount
    currency: str
    is_liquid: bool
    institution_name: str | None
    notes: str | None
    created_at: str


class TransactionCreateRequest(ApiModel):
    account_id: str | None = None
    transaction_date: IsoDate
    amount: Money
    transaction_type: Literal["credit", "debit"]
    category: ShortText
    description: LongText | None = None
    is_essential: bool = False


class TransactionResponse(ApiModel):
    id: str
    account_id: str | None
    transaction_date: str
    amount: Amount
    transaction_type: str
    category: str
    description: str | None
    is_essential: bool
    created_at: str


class InvestmentCreateRequest(ApiModel):
    asset_name: ShortText
    asset_type: AssetType
    symbol: OptionalShortText | None = None
    quantity: DecimalStr = Field(default="1.0000", gt=0, max_digits=20, decimal_places=4)
    purchase_price: Money
    current_value: Money
    is_liquid: bool = False
    last_valuation_date: IsoDate | None = None


class InvestmentResponse(ApiModel):
    id: str
    asset_name: str
    asset_type: str
    symbol: str | None
    quantity: Amount
    purchase_price: Amount
    current_value: Amount
    is_liquid: bool
    last_valuation_date: str | None
    created_at: str


class LiabilityCreateRequest(ApiModel):
    liability_name: ShortText
    liability_type: LiabilityType
    principal_amount: Money
    current_balance: Money
    interest_rate: Rate
    monthly_emi: Money
    remaining_months: int = Field(ge=0, le=1200)
    start_date: IsoDate | None = None
    end_date: IsoDate | None = None


class LiabilityResponse(ApiModel):
    id: str
    liability_name: ShortText
    liability_type: str
    principal_amount: Amount
    current_balance: Amount
    interest_rate: Amount
    monthly_emi: Amount
    remaining_months: int
    created_at: str


class NetWorthResponse(ApiModel):
    total_assets: Amount
    liquid_assets: Amount
    illiquid_assets: Amount
    total_liabilities: Amount
    net_worth: Amount


class CSVImportResponse(ApiModel):
    imported_count: int
    failed_count: int
    duplicate_count: int = 0
    errors: list[str] = []
    errors_truncated: bool = False
