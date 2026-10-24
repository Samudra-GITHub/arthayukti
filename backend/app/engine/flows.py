"""Monthly income, spending and surplus (docs/FINANCIAL_MODEL.md, section 3)."""

from dataclasses import dataclass
from decimal import Decimal

from app.engine.money import quantize
from app.engine.setup import Resolved
from app.timeline import month_to_index


@dataclass(frozen=True)
class Flows:
    income: Decimal
    expenses: Decimal
    commitments: Decimal
    one_offs: Decimal
    surplus: Decimal


def _step_up(rate: Decimal, t: int) -> Decimal:
    """Growth applied once per anniversary of the plan start: month 13 is the first step."""
    return (1 + rate) ** ((t - 1) // 12)


def month_flows(resolved: Resolved, t: int) -> Flows:
    income_factor = _step_up(resolved.income_growth, t)
    expense_factor = _step_up(resolved.expense_growth, t)

    year = (resolved.as_of_index + t - 1) // 12
    income = Decimal(0)
    for stream in resolved.streams:
        if stream.start_year is not None:
            # Scheduled stream: calendar years, its own growth and step-ups; plan-wide growth never applies.
            base = resolved.stream_bases.get(stream.id, {}).get(year)
            if base is None:
                continue
            amount = base
        else:
            if stream.ends_after is not None:
                last_t = month_to_index(stream.ends_after) - resolved.as_of_index + 1
                if t > last_t:
                    continue
            amount = stream.monthly_net * income_factor
        for cut in resolved.income_cuts:
            if cut.from_t <= t <= cut.to_t and cut.stream_id in (None, stream.id):
                amount *= cut.multiplier
        income += quantize(amount)

    expenses = sum(
        (quantize(item.monthly * expense_factor) for item in resolved.expenses), Decimal(0)
    )
    for shift in resolved.expense_shifts:
        if shift.from_t <= t <= shift.to_t:
            expenses += shift.delta

    commitments = sum(
        (c.monthly_payment for c in resolved.commitments if t <= c.remaining_months),
        Decimal(0),
    )
    one_offs = resolved.one_offs.get(t, Decimal(0))

    surplus = quantize(income - expenses - commitments + one_offs + resolved.extra_monthly)
    return Flows(
        income=quantize(income),
        expenses=quantize(expenses),
        commitments=quantize(commitments),
        one_offs=quantize(one_offs),
        surplus=surplus,
    )
