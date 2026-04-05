from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Product, Category
from app.schemas import ProductOut, ProductListOut, CategoryOut, CategoryCreate

router = APIRouter(prefix="/api", tags=["products"])


# --- Categories ---
@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    out = []
    for c in categories:
        count = (await db.execute(
            select(func.count(Product.id)).where(Product.category_id == c.id, Product.is_active == True)
        )).scalar() or 0
        item = CategoryOut.model_validate(c)
        item.products_count = count
        out.append(item)
    return out


# --- Products ---
@router.get("/products", response_model=ProductListOut)
async def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    category: str | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    featured: bool | None = None,
    sort: str = "newest",  # newest, price_asc, price_desc, rating
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).where(Product.is_active == True)

    if category:
        query = query.join(Category).where(Category.slug == category)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if featured is not None:
        query = query.where(Product.is_featured == featured)

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Sort
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.rating.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    products = result.scalars().all()

    items = []
    for p in products:
        item = ProductOut.model_validate(p)
        if p.category:
            item.category_name = p.category.name
        items.append(item)

    return ProductListOut(items=items, total=total, page=page, per_page=per_page)


@router.get("/products/featured", response_model=list[ProductOut])
async def featured_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product)
        .where(Product.is_active == True, Product.is_featured == True)
        .order_by(desc(Product.created_at))
        .limit(8)
    )
    return [ProductOut.model_validate(p) for p in result.scalars().all()]


@router.get("/products/{slug}", response_model=ProductOut)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.slug == slug))
    product = result.scalar()
    if not product:
        raise HTTPException(404, "Product not found")
    item = ProductOut.model_validate(product)
    if product.category:
        item.category_name = product.category.name
    return item
