from datetime import datetime
from pydantic import BaseModel, EmailStr


# --- Auth ---
class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    avatar_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None


# --- Category ---
class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    image_url: str | None
    products_count: int = 0

    class Config:
        from_attributes = True


# --- Product ---
class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    price: float
    compare_price: float | None = None
    image_url: str | None = None
    images: str | None = None
    category_id: int | None = None
    stock: int = 0
    is_featured: bool = False


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    price: float | None = None
    compare_price: float | None = None
    image_url: str | None = None
    images: str | None = None
    category_id: int | None = None
    stock: int | None = None
    is_featured: bool | None = None
    is_active: bool | None = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    price: float
    compare_price: float | None
    image_url: str | None
    images: str | None
    category_id: int | None
    category_name: str | None = None
    stock: int
    rating: float
    reviews_count: int
    is_featured: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    per_page: int


# --- Cart ---
class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    product_image: str | None = None
    product_price: float = 0
    quantity: int
    subtotal: float = 0

    class Config:
        from_attributes = True


class CartOut(BaseModel):
    items: list[CartItemOut]
    total: float
    items_count: int


# --- Order ---
class CheckoutRequest(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    payment_method: str = "card"


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total: float
    shipping_name: str | None
    shipping_address: str | None
    shipping_city: str | None
    shipping_zip: str | None
    payment_id: str | None
    payment_method: str
    items: list[CartItemOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


# --- Admin Stats ---
class AdminStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    orders_today: int
    revenue_today: float
    pending_orders: int
    low_stock_products: int
