import uuid
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def create_payment_intent(amount: float, currency: str = "usd") -> dict:
    """Create a mock payment intent (replace with real Stripe in production)."""
    if settings.STRIPE_SECRET_KEY.startswith("sk_test_mock"):
        # Mock payment
        payment_id = f"pi_mock_{uuid.uuid4().hex[:16]}"
        logger.info(f"Mock payment created: {payment_id} for ${amount:.2f}")
        return {
            "id": payment_id,
            "status": "succeeded",
            "amount": amount,
            "currency": currency,
        }

    # Real Stripe integration
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    intent = stripe.PaymentIntent.create(
        amount=int(amount * 100),
        currency=currency,
        automatic_payment_methods={"enabled": True},
    )
    return {
        "id": intent.id,
        "status": intent.status,
        "client_secret": intent.client_secret,
        "amount": amount,
        "currency": currency,
    }


async def refund_payment(payment_id: str) -> dict:
    """Refund a payment."""
    if payment_id.startswith("pi_mock_"):
        return {"id": f"re_mock_{uuid.uuid4().hex[:8]}", "status": "succeeded"}

    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    refund = stripe.Refund.create(payment_intent=payment_id)
    return {"id": refund.id, "status": refund.status}
