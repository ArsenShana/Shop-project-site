import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Product, Category, Order, OrderItem
from app.schemas import (
    AdminStats, ProductCreate, ProductUpdate, ProductOut,
    CategoryCreate, CategoryOut, OrderOut, OrderStatusUpdate, UserOut, CartItemOut,
)
from app.services.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
async def admin_stats(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    today = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_products = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    total_revenue = (await db.execute(
        select(func.sum(Order.total)).where(Order.status.in_(["paid", "shipped", "delivered"]))
    )).scalar() or 0
    orders_today = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= today)
    )).scalar() or 0
    revenue_today = (await db.execute(
        select(func.sum(Order.total)).where(Order.created_at >= today, Order.status.in_(["paid", "shipped", "delivered"]))
    )).scalar() or 0
    pending_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status == "pending")
    )).scalar() or 0
    low_stock = (await db.execute(
        select(func.count(Product.id)).where(Product.stock <= 5, Product.is_active == True)
    )).scalar() or 0

    return AdminStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        orders_today=orders_today,
        revenue_today=round(revenue_today, 2),
        pending_orders=pending_orders,
        low_stock_products=low_stock,
    )


# --- Product CRUD ---
@router.post("/products", response_model=ProductOut)
async def create_product(data: ProductCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return ProductOut.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(product_id: int, data: ProductUpdate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar()
    if not product:
        raise HTTPException(404, "Product not found")

    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(product, key, val)
    await db.commit()
    await db.refresh(product)
    return ProductOut.model_validate(product)


@router.delete("/products/{product_id}")
async def delete_product(product_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar()
    if not product:
        raise HTTPException(404, "Product not found")
    await db.delete(product)
    await db.commit()
    return {"ok": True}


# --- Category CRUD ---
@router.post("/categories", response_model=CategoryOut)
async def create_category(data: CategoryCreate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return CategoryOut.model_validate(cat)


@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar()
    if not cat:
        raise HTTPException(404, "Category not found")
    await db.delete(cat)
    await db.commit()
    return {"ok": True}


# --- Orders Management ---
@router.get("/orders", response_model=list[OrderOut])
async def list_orders(
    status: str | None = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).order_by(Order.created_at.desc())
    if status:
        query = query.where(Order.status == status)

    result = await db.execute(query.limit(100))
    orders = result.scalars().all()
    out = []
    for order in orders:
        await db.refresh(order, ["items"])
        for oi in order.items:
            await db.refresh(oi, ["product"])
        items = [CartItemOut(
            id=oi.id, product_id=oi.product_id,
            product_name=oi.product.name if oi.product else "",
            product_image=oi.product.image_url if oi.product else None,
            product_price=oi.price, quantity=oi.quantity,
            subtotal=round(oi.price * oi.quantity, 2),
        ) for oi in order.items]
        o = OrderOut.model_validate(order)
        o.items = items
        out.append(o)
    return out


@router.put("/orders/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar()
    if not order:
        raise HTTPException(404, "Order not found")

    order.status = data.status
    await db.commit()
    await db.refresh(order, ["items"])
    for oi in order.items:
        await db.refresh(oi, ["product"])

    items = [CartItemOut(
        id=oi.id, product_id=oi.product_id,
        product_name=oi.product.name if oi.product else "",
        product_image=oi.product.image_url if oi.product else None,
        product_price=oi.price, quantity=oi.quantity,
        subtotal=round(oi.price * oi.quantity, 2),
    ) for oi in order.items]
    o = OrderOut.model_validate(order)
    o.items = items
    return o


# --- Users ---
@router.get("/users", response_model=list[UserOut])
async def list_users(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(100))
    return [UserOut.model_validate(u) for u in result.scalars().all()]
