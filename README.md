# FE_Restaurant

A modern restaurant ordering and management system built with React and Supabase, featuring real-time order tracking and MoMo payment integration.

## Overview

FE_Restaurant is a full-stack restaurant application that allows customers to browse menus, place orders, and make payments online. The system uses Supabase for backend services (authentication, database, real-time updates) and a dedicated Node.js server for secure MoMo payment processing.

## Features

### Customer Features

- **User Authentication** - Secure login/registration with email and password
- **Browse Menu** - View products by category with search and filter
- **Shopping Cart** - Add/remove items, update quantities
- **Online Payment** - MoMo e-wallet integration for seamless checkout
- **Order Tracking** - Real-time order status updates
- **Order History** - View past orders and reorder
- **Profile Management** - Update personal information and addresses
- **Delivery Management** - Multiple delivery addresses support
- **Product Ratings** - View detailed product information with ratings
- **Real-time Cart Sync** - Cart synchronization using Supabase
- **Toast Notifications** - User feedback for all actions

### Restaurant/Admin Features (In Development)

- **Dashboard** - Overview of orders and sales
- **Menu Management** - CRUD operations for products and categories
- **Order Management** - Process orders, update status
- **Customer Management** - View customer information
- **Payment Tracking** - Monitor payment status
- **Analytics** - Sales reports and insights

### Technical Features

- **Real-time Updates** - Live order status changes with Supabase subscriptions
- **Responsive Design** - Mobile-friendly UI
- **Modern UI/UX** - Clean and intuitive interface with SASS/SCSS
- **Database Integration** - Supabase PostgreSQL backend
- **RESTful API** - Well-structured backend services
- **Optimized Performance** - Image optimization and lazy loading
- **Smart Cart Management** - Duplicate cart item consolidation
- **Custom Routing** - Client-side routing with React Router v7
- **Testing Ready** - Jest and React Testing Library integration

## Tech Stack

### Frontend

- **React 19.2.0** - UI framework
- **React Router DOM 7.9.4** - Navigation and routing
- **Supabase Client 2.75.0** - Backend integration
- **SASS 1.93.2** - CSS preprocessor
- **React Hot Toast 2.6.0** - Notifications
- **React Icons 5.5.0** - Icon library
- **Tippy.js 4.2.6** - Tooltips and popovers
- **ClassNames 2.5.1** - Conditional CSS classes
- **CLSX 2.1.1** - Utility for constructing className strings
- **Normalize.css 8.0.1** - CSS reset
- **Axios 1.12.2** - HTTP client

### Backend Services

- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication & Authorization
  - Real-time subscriptions
- **Node.js** - Runtime for payment server
- **Express 5.1.0** - Web framework for payment endpoints
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables management

### Development Tools

- **react-app-rewired 2.2.1** - Override create-react-app config
- **customize-cra 1.0.0** - Customize webpack configuration
- **babel-plugin-module-resolver 5.0.2** - Custom import paths (~ alias)
- **Jest & React Testing Library** - Testing framework
- **Concurrently** - Run multiple commands simultaneously

## Architecture

This project uses a **hybrid architecture**:

### 1. Supabase Direct Access (Primary)

Most operations communicate directly with Supabase from the frontend:

- **Authentication**: Supabase Auth SDK
- **Database Operations**: Direct queries to Supabase PostgreSQL
  - Products
  - Categories
  - Orders
  - Cart
  - Customer profiles

### 2. Backend Server (Payment Processing Only)

A lightweight Node.js/Express server handles:

- MoMo payment initialization
- Payment callbacks and webhooks (IPN)
- Payment status queries
- Secure signature generation with HMAC SHA-256

## Project Structure

```
FE_Restaurant/
├── public/                     # Static files
│   ├── index.html             # HTML template
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # SEO robots file
│
├── src/
│   ├── Api/                   # API layer and context providers
│   │   ├── supabase.js       # Supabase client initialization
│   │   ├── Auth.js           # Authentication context & hooks
│   │   ├── Cart.js           # Cart context & operations
│   │   ├── Customer.js       # Customer context & profile management
│   │   ├── Product.js        # Product data fetching
│   │   ├── Category.js       # Category data fetching
│   │   ├── Order.js          # Order management functions
│   │   ├── Payment.js        # Payment API calls
│   │   └── index.js          # Centralized exports
│   │
│   ├── Assest/               # Static assets
│   │   └── images/           # Images and icons
│   │
│   ├── Layout/               # Layout components
│   │   ├── DefaultLayout/    # Main layout wrapper
│   │   └── Components/       # Layout-specific components
│   │       ├── Customer/     # Customer-facing layouts
│   │       │   ├── Header/
│   │       │   ├── Footer/
│   │       │   ├── Menu/
│   │       │   ├── MenuSidebar/
│   │       │   ├── CreateOrder/
│   │       │   ├── PaymentReturn/
│   │       │   └── Image/
│   │       └── Button/       # Reusable button components
│   │
│   ├── Pages/                # Page components (route components)
│   │   ├── Customer/         # Customer pages
│   │   │   ├── Menu/         # Menu listing page
│   │   │   ├── ProductDetail/
│   │   │   ├── Cart/
│   │   │   ├── CreateOrder/
│   │   │   ├── Profile/
│   │   │   ├── CustomerProfile/
│   │   │   ├── Order/
│   │   │   ├── OrderList/
│   │   │   ├── OrderDetail/
│   │   │   ├── OnProcessOrder/
│   │   │   ├── ShippedOrder/
│   │   │   ├── PaymentSuccess/
│   │   │   ├── Login/
│   │   │   └── Registry/
│   │   ├── Restaurant/       # Restaurant management (in development)
│   │   │   └── index.js
│   │   └── Admin/            # Admin panel (in development)
│   │       └── index.js
│   │
│   ├── Routes/               # Route definitions
│   │   └── index.js          # Public and private routes
│   │
│   ├── App.js                # Root component with providers
│   ├── index.js              # Application entry point
│   ├── setupTests.js         # Test configuration
│   └── reportWebVitals.js    # Performance monitoring
│
├── server/                   # Payment backend server
│   ├── config/
│   │   ├── momo.config.js    # MoMo configuration
│   │   └── supabase.js       # Server-side Supabase client
│   ├── controllers/
│   │   └── momoController.js # MoMo payment handlers
│   ├── routes/
│   │   └── payment.js        # Payment routes
│   ├── index.js              # Server entry point
│   ├── package.json          # Server dependencies
│   └── .env                  # Server environment variables
│
├── database/                 # Database migrations (optional)
│   └── migrations/
│
├── build/                    # Production build output
├── config-overrides.js       # Webpack customization
├── jsconfig.json             # JavaScript configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **Git**
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))
- **MoMo Business Account** (for payment integration)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/FE_Restaurant.git
cd FE_Restaurant
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

Or use the combined script:

```bash
npm run install:all
```

## Configuration

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
REACT_APP_API_URL=http://localhost:5000
```

**How to get Supabase credentials:**

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration (for server-side operations)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# MoMo Payment Configuration
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=http://localhost:3000/payment/success
MOMO_IPN_URL=http://localhost:5000/api/momo/ipn
```

### Supabase Database Setup

You'll need to create the following tables in your Supabase project:

**Tables:**

- `customer` - Customer profiles
- `category` - Product categories
- `product` - Menu items/products
- `cart` - Shopping cart items
- `orders` - Customer orders
- `order_detail` - Order line items
- `payment` - Payment records

See [Database Schema](#database-schema) section for detailed schema.

## Running the Application

### Development Mode

**Frontend :**

```bash
npm start
```

**Backend :**

```bash
npm run server
# Or manually:
cd server
npm start
```

### Production Mode

1. **Build the frontend:**

   ```bash
   npm run build
   ```

2. **Serve the production build:**

   ```bash
   npx serve -s build
   ```

3. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```

## Available Scripts

### Frontend Scripts

| Script                | Command                  | Description                         |
| --------------------- | ------------------------ | ----------------------------------- |
| `npm start`           | Start development server | Runs app at http://localhost:3000   |
| `npm run build`       | Build for production     | Creates optimized build in `build/` |
| `npm test`            | Run tests                | Launches test runner in watch mode  |
| `npm run eject`       | Eject from CRA           | **Warning: One-way operation!**     |
| `npm run server`      | Start backend            | Starts payment server               |
| `npm run dev`         | Run full stack           | Runs both frontend and backend      |
| `npm run install:all` | Install all deps         | Installs frontend + backend deps    |

### Backend Scripts

| Script        | Command          | Description                          |
| ------------- | ---------------- | ------------------------------------ |
| `npm start`   | Start server     | Runs server at http://localhost:5000 |
| `npm run dev` | Development mode | Runs with auto-reload on changes     |

## Key Features Implementation

### Routing

**Public Routes** (accessible to all):

- `/` - Menu page
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/login` - Login page
- `/registry` - Registration page
- `/order/:id` - Order details
- `/payment/success` - Payment success
- `/payment/return` - Payment callback

**Protected Routes** (requires authentication):

- `/profile` - User profile
- `/createorder` - Checkout page
- `/orders` - Order history
- `/orders/:id` - Specific order details

**Private Routes** (admin/restaurant only):

- `/restaurant` - Restaurant dashboard
- `/admin` - Admin panel

## API Documentation

### Base URL

```
Backend: http://localhost:5000
Supabase: https://your-project.supabase.co
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Run tests in watch mode:

```bash
npm test -- --watch
```
## Support

For issues and questions:

- Email: lyphuclinh2901@gmail.com
- Issues: [GitHub Issues](https://github.com/hey129/FE_Restaurant/issues)
- Documentation: This README and inline code comments

---

**Built with React and Supabase**
