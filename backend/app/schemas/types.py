"""Shared field types.

Money and rates are decimal strings on the wire. JSON numbers are rejected so that
no amount can pass through a float.
"""

import re
from decimal import Decimal
from typing import Annotated, Any

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    StringConstraints,
    WithJsonSchema,
)

DECIMAL_PATTERN = r"^-?\d+(\.\d+)?$"
MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"
MAX_MONEY = Decimal("1000000000.00")  # Rs 100 crore

_DECIMAL_RE = re.compile(DECIMAL_PATTERN)


def _decimal_from_string(value: Any) -> Decimal:
    if isinstance(value, Decimal):
        return value
    if isinstance(value, str) and _DECIMAL_RE.match(value):
        return Decimal(value)
    raise ValueError("must be a decimal string such as '1250.50' (JSON numbers are not accepted)")


DecimalStr = Annotated[
    Decimal,
    BeforeValidator(_decimal_from_string),
    WithJsonSchema({"type": "string", "pattern": DECIMAL_PATTERN}),
]

# Inputs (validated)
Money = Annotated[DecimalStr, Field(ge=0, le=MAX_MONEY, max_digits=14, decimal_places=2)]
PositiveMoney = Annotated[DecimalStr, Field(gt=0, le=MAX_MONEY, max_digits=14, decimal_places=2)]
SignedMoney = Annotated[
    DecimalStr, Field(ge=-MAX_MONEY, le=MAX_MONEY, max_digits=14, decimal_places=2)
]
Rate = Annotated[DecimalStr, Field(ge=0, le=Decimal("0.30"), max_digits=8, decimal_places=6)]
GrowthRate = Annotated[
    DecimalStr, Field(ge=Decimal("-0.10"), le=Decimal("0.30"), max_digits=8, decimal_places=6)
]
Fraction = Annotated[DecimalStr, Field(ge=0, le=1, max_digits=8, decimal_places=4)]
Multiplier = Annotated[DecimalStr, Field(ge=0, le=5, max_digits=8, decimal_places=4)]

# Outputs (computed by the engine, not user-validated)
Amount = DecimalStr

Month = Annotated[str, StringConstraints(pattern=MONTH_PATTERN)]
Id = Annotated[str, StringConstraints(pattern=r"^[A-Za-z0-9_-]{1,40}$")]
Label = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]


class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
