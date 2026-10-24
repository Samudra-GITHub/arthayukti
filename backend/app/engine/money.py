"""Rounding rules. Everything is quantised to the paisa; only required amounts round up."""

from decimal import ROUND_CEILING, ROUND_HALF_UP, Decimal

PAISE = Decimal("0.01")


def quantize(amount: Decimal) -> Decimal:
    """Round half-up to the paisa."""
    return amount.quantize(PAISE, rounding=ROUND_HALF_UP)


def ceil_paise(amount: Decimal) -> Decimal:
    """Round up to the paisa, so a required amount is never understated."""
    return amount.quantize(PAISE, rounding=ROUND_CEILING)
