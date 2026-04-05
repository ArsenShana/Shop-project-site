from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Product, CartItem
from app.schemas import CartItemAdd, CartItemUpdate, CartItemOut, CartOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["cart"])


async def _build_cart(db: AsyncSession, user_id: int) -> CartOut:
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == user_id)
    )
    cart_items = result.scalars().all()

    items = []
    total = 0
    for ci in cart_items:
        product = (await db.execute(select(Product).where(Product.id == ci.product_id))).scalar()
        if not product:
            continue
        subtotal = product.price * ci.quantity
        total += subtotal
        items.append(CartItemOut(
            id=ci.id,
            product_id=product.id,
            product_name=product.name,
            product_image=product.image_url,
            product_price=product.price,
            quantity=ci.quantity,
            subtotal=round(subtotal, 2),
        ))

    return CartOut(items=items, total=round(total, 2), items_count=len(items))


@router.get("/", response_model=CartOut)
async def get_cart(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _build_cart(db, user.id)


@router.post("/", response_model=CartOut)
async def add_to_cart(
    data: CartItemAdd,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = (await db.execute(select(Product).where(Product.id == data.product_id))).scalar()
    if not product or not product.is_active:
        raise HTTPException(404, "Product not found")
    if product.stock < data.quantity:
        raise HTTPException(400, "Not enough stock")

    existing = (await db.execute(
        select(CartItem).where(CartItem.user_id == user.id, CartItem.product_id == data.product_id)
    )).scalar()

    if existing:
        existing.quantity += data.quantity
    else:
        db.add(CartItem(user_id=user.id, product_id=data.product_id, quantity=data.quantity))

    await db.commit()
    return await _build_cart(db, user.id)


@router.put("/{item_id}", response_model=CartOut)
async def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user.id)
    )).scalar()
    if not item:
        raise HTTPException(404, "Cart item not found")

    if data.quantity <= 0:
        await db.delete(item)
    else:
        item.quantity = data.quantity

    await db.commit()
    return await _build_cart(db, user.id)


@router.delete("/{item_id}", response_model=CartOut)
async def remove_from_cart(
    item_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = (await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user.id)
    )).scalar()
    if not item:
        raise HTTPException(404, "Cart item not found")

    await db.delete(item)
    await db.commit()
    return await _build_cart(db, user.id)


@router.delete("/", response_model=CartOut)
async def clear_cart(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).where(CartItem.user_id == user.id))
    for item in result.scalars().all():
        await db.delete(item)
    await db.commit()
    return CartOut(items=[], total=0, items_count=0)
