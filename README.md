# Letlalo E-commerce Platform

A full-featured e-commerce platform for Letlalo - an Afrocentric/African gift store in Lagos with worldwide shipping.

**Live Site:** [Coming Soon]
**Admin Dashboard:** `/admin/login`

## Features

### Customer-Facing
- 🏠 Beautiful landing page with featured products
- 🛍️ Product browsing with search and category filtering
- 🛒 Shopping cart with persistent storage
- 💳 Secure checkout with Paystack payment integration
- 📦 Order tracking system
- 📱 Fully responsive design

### Admin Dashboard
- 🔐 Secure authentication
- 📊 Dashboard with key metrics
- ✏️ Product management (CRUD operations)
- 📋 Order management with status updates
- 🚚 Tracking number assignment
- 👁️ Product visibility controls

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Supabase** - Backend, database, and authentication
- **Paystack** - Payment processing
- **Zustand** - State management
- **React Hot Toast** - Notifications
- **Netlify** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([supabase.com](https://supabase.com))
- A Paystack account ([paystack.com](https://paystack.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. In your Supabase project, go to the SQL Editor
3. Copy the contents of `supabase_schema.sql` and run it in the SQL Editor
4. Go to Settings > API to get your project URL and anon key

### 3. Set Up Paystack

1. Create an account at [paystack.com](https://paystack.com)
2. Go to Settings > API Keys & Webhooks
3. Copy your Public Key (use Test key for development)

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key
```

### 5. Create Admin User

1. Go to your Supabase project > Authentication > Users
2. Create a new user with your email and password
3. Go to SQL Editor and run:

```sql
INSERT INTO admin_users (email, name, role)
VALUES ('your-email@example.com', 'Your Name', 'admin');
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

Admin dashboard: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── shop/                       # Shop page with filtering
│   ├── products/[slug]/            # Product detail page
│   ├── checkout/                   # Checkout page
│   ├── orders/[orderNumber]/       # Order confirmation
│   ├── track-order/                # Order tracking
│   ├── contact/                    # Contact page
│   └── admin/
│       ├── login/                  # Admin login
│       └── dashboard/              # Admin dashboard
│           ├── page.tsx            # Dashboard overview
│           ├── products/           # Product management
│           └── orders/             # Order management
├── components/
│   ├── header.tsx                  # Site header
│   ├── cart-sheet.tsx              # Shopping cart
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── types.ts                    # TypeScript types
│   ├── paystack.ts                 # Paystack utilities
│   ├── store/
│   │   └── cart-store.ts           # Cart state management
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # Server client
│       └── middleware.ts           # Auth middleware
├── supabase_schema.sql             # Database schema
└── .env.local.example              # Environment variables template
```

## Database Schema

The platform uses the following main tables:

- **products** - Product catalog with images, pricing, inventory
- **categories** - Product categories
- **orders** - Customer orders with items and shipping info
- **order_status_history** - Order status tracking
- **admin_users** - Admin authentication

See `supabase_schema.sql` for the complete schema with RLS policies.

## Key Features Explained

### Shopping Cart

The cart uses Zustand for state management with localStorage persistence. Users can:
- Add/remove items
- Update quantities
- Cart persists across sessions

### Checkout Flow

1. Customer fills in shipping information
2. Reviews order summary
3. Clicks "Pay" button
4. Paystack popup opens for payment
5. On successful payment:
   - Order is created in database
   - Payment status updated
   - Order confirmation email sent (via Paystack)
   - Customer redirected to order page

### Admin Dashboard

Access at `/admin/login` with credentials created in Supabase Auth.

**Product Management:**
- Create, edit, delete products
- Upload multiple product images
- Toggle visibility (hide/show from customers)
- Mark as sold out
- Manage inventory

**Order Management:**
- View all orders
- Filter by status
- Update order status
- Add tracking numbers
- View customer details and shipping address

## Customization

### Brand Colors

Update colors in `app/globals.css`:

```css
--primary: 28 100% 24%;        /* #7C4700 */
--secondary: 26 50% 14%;       /* #351E10 */
```

### Product Categories

Categories are managed in the database. Add new categories:

```sql
INSERT INTO categories (name, slug, description, is_visible)
VALUES ('Your Category', 'your-category', 'Description', true);
```

### Payment Configuration

For production, update `.env.local` with your live Paystack key:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your-live-key
```

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Build settings are auto-detected from `netlify.toml`
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
7. Deploy!

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in the Vercel dashboard.

## Support

For issues or questions:
- Instagram: [@letlalo_ng](https://www.instagram.com/letlalo_ng)
- Linktree: [linktr.ee/letlalonig](https://linktr.ee/letlalonig)

## License

This project is proprietary software for Letlalo.

---

Built with ❤️ for Letlalo - It's not Letlalo if it's not Afrocentric
