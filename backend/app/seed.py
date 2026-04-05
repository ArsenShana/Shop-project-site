"""Seed database with demo data."""
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Category, Product
from app.services.auth import hash_password
from app.config import settings

logger = logging.getLogger(__name__)

CATEGORIES = [
    {"name": "Electronics", "slug": "electronics", "description": "Phones, laptops, gadgets and accessories", "image_url": None},
    {"name": "Clothing", "slug": "clothing", "description": "Fashion for everyone", "image_url": None},
    {"name": "Home & Garden", "slug": "home-garden", "description": "Everything for your home", "image_url": None},
    {"name": "Sports", "slug": "sports", "description": "Sports equipment and activewear", "image_url": None},
    {"name": "Accessories", "slug": "accessories", "description": "Watches, bags, jewelry and more", "image_url": None},
    {"name": "Books", "slug": "books", "description": "Bestsellers, fiction, non-fiction and more", "image_url": None},
]

PRODUCTS = [
    # Electronics
    {"name": "Wireless Noise-Cancelling Headphones", "slug": "wireless-headphones", "price": 299.99, "compare_price": 399.99, "stock": 45, "rating": 4.8, "reviews_count": 234, "is_featured": True, "category_slug": "electronics", "description": "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.", "image_url": None},
    {"name": "Smart Watch Pro", "slug": "smart-watch-pro", "price": 449.99, "compare_price": 549.99, "stock": 30, "rating": 4.6, "reviews_count": 189, "is_featured": True, "category_slug": "electronics", "description": "Advanced smartwatch with health monitoring, GPS tracking, and seamless smartphone integration. Water-resistant up to 50m.", "image_url": None},
    {"name": "4K Ultra HD Camera", "slug": "4k-camera", "price": 899.99, "compare_price": None, "stock": 15, "rating": 4.9, "reviews_count": 67, "is_featured": True, "category_slug": "electronics", "description": "Professional-grade mirrorless camera with 4K video recording, advanced autofocus, and interchangeable lens system.", "image_url": None},
    {"name": "Portable Bluetooth Speaker", "slug": "bluetooth-speaker", "price": 79.99, "compare_price": 99.99, "stock": 120, "rating": 4.5, "reviews_count": 456, "is_featured": False, "category_slug": "electronics", "description": "Compact waterproof speaker with 360-degree sound, 12-hour battery, and built-in microphone for calls.", "image_url": None},
    {"name": "Mechanical Gaming Keyboard", "slug": "gaming-keyboard", "price": 159.99, "compare_price": None, "stock": 60, "rating": 4.7, "reviews_count": 312, "is_featured": False, "category_slug": "electronics", "description": "RGB mechanical keyboard with Cherry MX switches, programmable macros, and aircraft-grade aluminum frame.", "image_url": None},
    {"name": "Smart Home Hub", "slug": "smart-home-hub", "price": 129.99, "compare_price": 169.99, "stock": 55, "rating": 4.4, "reviews_count": 278, "is_featured": True, "category_slug": "electronics", "description": "Central hub for all your smart home devices. Voice control, automation, and energy monitoring.", "image_url": None},
    {"name": "Wireless Earbuds Elite", "slug": "wireless-earbuds", "price": 199.99, "compare_price": 249.99, "stock": 85, "rating": 4.7, "reviews_count": 523, "is_featured": False, "category_slug": "electronics", "description": "True wireless earbuds with spatial audio, adaptive EQ, and 8-hour battery life per charge.", "image_url": None},

    # Clothing
    {"name": "Premium Leather Jacket", "slug": "leather-jacket", "price": 349.99, "compare_price": 449.99, "stock": 25, "rating": 4.7, "reviews_count": 98, "is_featured": True, "category_slug": "clothing", "description": "Handcrafted genuine leather jacket with satin lining. Timeless style meets modern comfort.", "image_url": None},
    {"name": "Classic Denim Jeans", "slug": "denim-jeans", "price": 89.99, "compare_price": None, "stock": 200, "rating": 4.4, "reviews_count": 567, "is_featured": False, "category_slug": "clothing", "description": "Premium stretch denim with perfect fit. Available in multiple washes and sizes.", "image_url": None},
    {"name": "Merino Wool Sweater", "slug": "merino-sweater", "price": 129.99, "compare_price": 159.99, "stock": 70, "rating": 4.6, "reviews_count": 145, "is_featured": False, "category_slug": "clothing", "description": "Ultra-soft merino wool sweater. Naturally temperature regulating and odor resistant.", "image_url": None},
    {"name": "Linen Summer Shirt", "slug": "linen-shirt", "price": 69.99, "compare_price": None, "stock": 110, "rating": 4.3, "reviews_count": 203, "is_featured": False, "category_slug": "clothing", "description": "Breathable pure linen shirt perfect for warm weather. Relaxed fit with a modern collar.", "image_url": None},

    # Sports
    {"name": "Running Sneakers Ultra", "slug": "running-sneakers", "price": 179.99, "compare_price": 219.99, "stock": 80, "rating": 4.6, "reviews_count": 234, "is_featured": True, "category_slug": "sports", "description": "Lightweight running shoes with responsive cushioning, breathable mesh upper, and superior grip.", "image_url": None},
    {"name": "Yoga Mat Premium", "slug": "yoga-mat", "price": 49.99, "compare_price": None, "stock": 150, "rating": 4.8, "reviews_count": 789, "is_featured": False, "category_slug": "sports", "description": "Extra-thick non-slip yoga mat with alignment markers. Eco-friendly TPE material.", "image_url": None},
    {"name": "Adjustable Dumbbell Set", "slug": "dumbbell-set", "price": 349.99, "compare_price": 429.99, "stock": 35, "rating": 4.8, "reviews_count": 167, "is_featured": True, "category_slug": "sports", "description": "Space-saving adjustable dumbbells from 5 to 52.5 lbs. Quick-change weight system.", "image_url": None},

    # Home & Garden
    {"name": "Minimalist Desk Lamp", "slug": "desk-lamp", "price": 69.99, "compare_price": 89.99, "stock": 90, "rating": 4.5, "reviews_count": 156, "is_featured": True, "category_slug": "home-garden", "description": "Modern LED desk lamp with adjustable brightness, color temperature control, and wireless charging base.", "image_url": None},
    {"name": "Ceramic Plant Pot Set", "slug": "plant-pot-set", "price": 39.99, "compare_price": None, "stock": 200, "rating": 4.3, "reviews_count": 345, "is_featured": False, "category_slug": "home-garden", "description": "Set of 3 handmade ceramic pots with drainage holes. Matte finish in neutral tones.", "image_url": None},
    {"name": "Aromatherapy Diffuser", "slug": "aroma-diffuser", "price": 44.99, "compare_price": 59.99, "stock": 130, "rating": 4.5, "reviews_count": 412, "is_featured": False, "category_slug": "home-garden", "description": "Ultrasonic essential oil diffuser with ambient LED lighting and whisper-quiet operation.", "image_url": None},

    # Accessories
    {"name": "Minimalist Leather Wallet", "slug": "leather-wallet", "price": 59.99, "compare_price": None, "stock": 180, "rating": 4.6, "reviews_count": 321, "is_featured": False, "category_slug": "accessories", "description": "Slim RFID-blocking leather wallet with 6 card slots and cash compartment. Full-grain leather.", "image_url": None},
    {"name": "Titanium Sunglasses", "slug": "titanium-sunglasses", "price": 189.99, "compare_price": 239.99, "stock": 40, "rating": 4.7, "reviews_count": 112, "is_featured": True, "category_slug": "accessories", "description": "Polarized titanium frame sunglasses with UV400 protection. Ultra-lightweight at just 18g.", "image_url": None},
    {"name": "Canvas Backpack", "slug": "canvas-backpack", "price": 99.99, "compare_price": None, "stock": 95, "rating": 4.4, "reviews_count": 267, "is_featured": False, "category_slug": "accessories", "description": "Waxed canvas backpack with padded laptop sleeve. Water-resistant with brass hardware.", "image_url": None},

    # Books
    {"name": "The Art of Minimalism", "slug": "art-of-minimalism", "price": 24.99, "compare_price": None, "stock": 300, "rating": 4.5, "reviews_count": 892, "is_featured": False, "category_slug": "books", "description": "A guide to living with less and finding more. Practical tips for decluttering your life and mind.", "image_url": None},
    {"name": "Modern Design Handbook", "slug": "design-handbook", "price": 49.99, "compare_price": 64.99, "stock": 75, "rating": 4.8, "reviews_count": 234, "is_featured": True, "category_slug": "books", "description": "Comprehensive guide to contemporary design principles. Over 500 full-color illustrations.", "image_url": None},
    {"name": "Cooking with Fire", "slug": "cooking-with-fire", "price": 34.99, "compare_price": None, "stock": 160, "rating": 4.6, "reviews_count": 445, "is_featured": False, "category_slug": "books", "description": "Master the art of open-flame cooking with 120 recipes from wood-fired oven to campfire.", "image_url": None},
]


async def seed_database(session: AsyncSession):
    """Seed with demo data if database is empty."""
    existing = await session.execute(select(User).limit(1))
    if existing.scalar():
        return

    logger.info("Seeding database with demo data...")

    # Create admin user
    admin = User(
        email=settings.ADMIN_EMAIL,
        name="Admin",
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        role="admin",
    )
    session.add(admin)

    # Create demo user
    demo = User(
        email="user@shop.com",
        name="John Doe",
        hashed_password=hash_password("user123"),
        role="user",
    )
    session.add(demo)

    # Create categories
    cat_map = {}
    for c in CATEGORIES:
        cat = Category(**c)
        session.add(cat)
        cat_map[c["slug"]] = cat

    await session.flush()

    # Create products
    for p in PRODUCTS:
        cat_slug = p.pop("category_slug")
        product = Product(**p, category_id=cat_map[cat_slug].id)
        session.add(product)

    await session.commit()
    logger.info("Database seeded successfully")
