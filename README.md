# ShopSphere

A refined, responsive e-commerce storefront built with React and Vite. ShopSphere demonstrates a realistic shopping flow with product discovery, filters, favorites, persistent cart state, product details, and validated checkout.

## Features

- Responsive editorial storefront and product catalog
- Search, category filtering, and multiple sort modes
- Product detail pages with quantity controls
- Favorites and shopping cart persisted in local storage
- Form validation and simulated checkout flow
- Email/password registration, login, password reset, and protected account page
- Supabase profile storage with Row Level Security policies
- Empty states, missing-product handling, and a 404 page
- Responsive navigation and layouts for desktop, tablet, and mobile

## Technologies

React, React Router, Context API, Vite, Supabase Auth/Postgres, Lucide React, CSS, and localStorage.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Configure customer accounts

1. Create a Supabase project.
2. Open its SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add the project URL and publishable key from the Supabase Connect dialog.
5. In Supabase Authentication URL Configuration, set the Site URL to the deployed GitHub Pages URL and add the same URL to Redirect URLs.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

For GitHub Pages, create repository secrets with those same two names. The deployment workflow exposes them only as the public values required by the Vite build. Never use a Supabase service-role key in this application.

## Project structure

```text
src/
├── assets/       Generated brand imagery
├── components/   Shared interface components
├── context/      Cart and favorites state
├── data/         Mock product catalog
├── pages/        Routed application pages
└── utils/        Formatting helpers
```

## Data and checkout

Product information is realistic mock data, not a live database. Checkout is a portfolio demonstration and does not process real payments.

## Future improvements

Authentication, a product API, inventory management, customer reviews, order history, and Stripe checkout.

## Portfolio summary

Designed and developed a responsive multi-page e-commerce experience using React Router and Context API, featuring persistent cart and favorites state, catalog search and filters, product detail routes, and a validated checkout journey.
