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

## Configure store administration

The private admin page is at `/#/admin`. The API routes require a Vercel deployment; GitHub Pages cannot run these server functions. Create a Firestore database in the same Firebase project, then configure these server-only environment variables in Vercel:

- `FIREBASE_SERVICE_ACCOUNT_JSON`: the Firebase service-account JSON from Project settings → Service accounts. Keep this private and never prefix it with `VITE_`.
- `ADMIN_UIDS`: comma-separated Firebase Auth UIDs allowed to manage the store. Find your UID in Firebase Authentication after creating your owner account. A normal signup never grants admin access.
- `STRIPE_SECRET_KEY`: the server-side Stripe secret key. The admin page displays recent Checkout sessions and can issue full refunds; Stripe remains the financial record.
- `RESEND_API_KEY`, `FROM_EMAIL`, and `SUPPORT_REPLY_TO`: verified Resend sender and support reply address for one-to-one customer email.

Copy the server variable names from `.env.example`, add values under the Vercel project environment settings, and redeploy. The dashboard synchronizes carts for signed-in customers; guest carts remain in that guest's browser. Email replies are delivered to `SUPPORT_REPLY_TO`, not displayed as inbound chat in the dashboard. Client and API errors are recorded in Firestore and can be marked resolved in the admin page.

Admin product edits are stored in Firestore and used by the storefront and checkout. Existing static products remain available as the initial catalog. Store customer data and payment information securely; never expose the service-account JSON, Stripe secret, or Resend key to browser code.

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

The initial product catalog is bundled sample data. The app can use Firestore for admin-managed catalog items and Stripe Checkout for real payment sessions when the server environment is configured. Without those server credentials, the management API is unavailable.

## Future improvements

Supplier feeds, inventory synchronization, inbound email conversations, and a full order-management workflow.

## Portfolio summary

Designed and developed a responsive multi-page e-commerce experience using React Router and Context API, featuring persistent cart and favorites state, catalog search and filters, product detail routes, and a validated checkout journey.
