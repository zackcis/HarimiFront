# HARIMI Storefront (Next.js)

Premium guest ecommerce UI. Laravel (`HarimiBackOffice`) owns all commerce data via `/api/v1`.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Storefront: http://localhost:3000  
API (Laravel): http://127.0.0.1:8000/api/v1

Ensure Laravel is running (`composer run dev` in `HarimiBackOffice`) and CORS allows `http://localhost:3000`.

## Routes

- `/` — Welcome (Donna | Uomo)
- `/{locale}/{audience}` — Home
- `/{locale}/{audience}/shop` — PLP / search
- `/{locale}/p/{slug}` — PDP
- `/{locale}/cart` — Cart (localStorage)
- `/{locale}/checkout` — Guest checkout (pending payment until Stripe)
- `/{locale}/checkout/confirmation` — Confirmation
- `/{locale}/brands` — Brand index

## Note

Payment with Stripe is the next backend+frontend increment. Checkout currently creates a `pending_payment` order.
