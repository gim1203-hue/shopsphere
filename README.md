# ShopSphere

A refined, responsive e-commerce storefront built with React and Vite. ShopSphere demonstrates a realistic shopping flow with product discovery, filters, favorites, persistent cart state, product details, and validated checkout.

## Features

- Responsive editorial storefront and product catalog
- Search, category filtering, and multiple sort modes
- Product detail pages with quantity controls
- Favorites and shopping cart persisted in local storage
- Form validation and simulated checkout flow
- Email/password registration, login, password reset, and protected account page
- Firebase email/password authentication and customer profiles
- Empty states, missing-product handling, and a 404 page
- Responsive navigation and layouts for desktop, tablet, and mobile

## Technologies

React, React Router, Context API, Vite, Firebase Auth, Lucide React, CSS, and localStorage.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Configure customer accounts

1. Create a Firebase project and register a web app.
2. In Authentication, enable the Email/Password provider.
3. Copy `.env.example` to `.env.local`.
4. Add the Firebase web app configuration values from Project settings.
5. Add the same six values as GitHub Actions repository secrets for public deployment.

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

For GitHub Pages, create repository secrets with those same six names. Firebase web configuration values are public client settings; do not place private server credentials in the frontend.

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
