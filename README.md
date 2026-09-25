# ShopSphere

A refined, responsive e-commerce storefront built with React and Vite. ShopSphere demonstrates a realistic shopping flow with product discovery, filters, favorites, persistent cart state, product details, and validated checkout.

## Features

- Responsive editorial storefront and product catalog
- Search, category filtering, and multiple sort modes
- Product detail pages with quantity controls
- Favorites and shopping cart persisted in local storage
- Form validation and simulated checkout flow
- Empty states, missing-product handling, and a 404 page
- Responsive navigation and layouts for desktop, tablet, and mobile

## Technologies

React, React Router, Context API, Vite, Lucide React, CSS, and localStorage.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

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
