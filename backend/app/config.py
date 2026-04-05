import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "ShopAPI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/shop.db")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Stripe
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock")

    # Admin
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@shop.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")

    class Config:
        env_file = ".env"


settings = Settings()
