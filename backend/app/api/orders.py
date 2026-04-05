from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, CartItem, Product, Order, OrderItem
from app.schemas import CheckoutRequest, OrderOut, CartItemOut
from app.services.auth import get_current_user
from app.services.payment import create_payment_intent

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _order_to_out(order: Order) -> OrderOut:
    items = []
    for oi in order.items:
        items.append(CartItemOut(
            id=oi.id,
            product_id=oi.product_id,
            product_name=oi.product.name if oi.product else "",
            product_image=oi.product.image_url if oi.product else None,
            product_price=oi.price,
            quantity=oi.quantity,
            subtotal=round(oi.price * oi.quantity, 2),
        ))
    out = OrderOut.model_validate(order)
    out.items = items
    return out


@router.post("/checkout", response_model=OrderOut)
async def checkout(
    data: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get cart items
    result = await db.execute(select(CartItem).where(CartItem.user_id == user.id))
    cart_items = result.scalars().all()
    if not cart_items:
        raise HTTPException(400, "Cart is empty")

    # Calculate total and validate stock
    total = 0
    order_items = []
    for ci in cart_items:
        product = (await db.execute(select(Product).where(Product.id == ci.product_id))).scalar()
        if not product:
            raise HTTPException(400, f"Product not found")
        if product.stock < ci.quantity:
            raise HTTPException(400, f"Not enough stock for {product.name}")

        total += product.price * ci.quantity
        order_items.append((product, ci.quantity))

    total = round(total, 2)

    # Process payment
    payment = await create_payment_intent(total)

    # Create order
    order = Order(
        user_id=user.id,
        total=total,
        status="paid" if payment["status"] == "succeeded" else "pending",
        shipping_name=data.shipping_name,
        shipping_address=data.shipping_address,
        shipping_city=data.shipping_city,
        shipping_zip=data.shipping_zip,
        payment_id=payment["id"],
        payment_method=data.payment_method,
    )
    db.add(order)
    await db.flush()

    # Create order items and reduce stock
    for product, qty in order_items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            price=product.price,
        ))
        product.stock -= qty

    # Clear cart
    for ci in cart_items:
        await db.delete(ci)

    await db.commit()

    # Reload with items
    result = await db.execute(select(Order).where(Order.id == order.id))
    order = result.scalar()
    await db.refresh(order, ["items"])
    for oi in order.items:
        await db.refresh(oi, ["product"])

    return _order_to_out(order)


@router.get("/", response_model=list[OrderOut])
async def my_orders(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    out = []
    for order in orders:
        await db.refresh(order, ["items"])
        for oi in order.items:
            await db.refresh(oi, ["product"])
        out.append(_order_to_out(order))
    return out


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar()
    if not order:
        raise HTTPException(404, "Order not found")
    if order.user_id != user.id and user.role != "admin":
        raise HTTPException(403, "Access denied")

    await db.refresh(order, ["items"])
    for oi in order.items:
        await db.refresh(oi, ["product"])
    return _order_to_out(order)
