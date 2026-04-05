# Project Shop

Full-stack e-commerce web application with product catalog, shopping cart, order management, and admin panel.

## Tech Stack

**Backend:** FastAPI, SQLAlchemy (async), SQLite, JWT authentication
**Frontend:** React 18, React Router, Vite, Framer Motion, Lucide icons
**Infrastructure:** Docker Compose, Nginx

## Features

- User registration and JWT-based authentication
- Product catalog with detail pages
- Shopping cart
- Checkout and order history
- Admin panel for managing products and orders
- Stripe payment integration (test mode)
- Responsive UI with animations

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/project-shop.git
cd project-shop

# 2. Create backend .env from example
cp backend/.env.example backend/.env
# Edit backend/.env and set your SECRET_KEY

# 3. Run with Docker Compose
docker compose up --build
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001
- API docs: http://localhost:8001/docs

## Project Structure

```
project-shop/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # Route handlers (auth, products, cart, orders, admin)
│   │   ├── services/  # Business logic (auth, payment)
│   │   ├── models.py  # SQLAlchemy models
│   │   ├── schemas.py # Pydantic schemas
│   │   └── config.py  # Settings
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/          # React SPA
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Shared components
│   │   └── hooks/     # Auth & cart hooks
│   ├── Dockerfile
│   └── vite.config.js
├── nginx/             # Nginx config (if used outside Docker)
├── docker-compose.yml
└── .gitignore
```

## License

MIT
