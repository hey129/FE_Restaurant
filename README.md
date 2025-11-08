# FE_Restaurant

A modern restaurant ordering and management system built with React and Supabase, featuring real-time order tracking and MoMo payment integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Overview

FE_Restaurant is a full-stack restaurant application that allows customers to browse menus, place orders, and make payments online. The system uses Supabase for backend services (authentication, database, real-time updates) and a dedicated Node.js server for secure MoMo payment processing.

## Features

### Customer Features

- Browse menu with categories and search functionality
- View detailed product information with ratings
- Real-time shopping cart management
- User authentication (Register/Login) with Supabase Auth
- Customer profile management
- Place orders with delivery address customization
- Secure MoMo payment integration
- Order history and tracking
- View order details with product information
- Payment confirmation and order status updates

### Restaurant/Admin Features (In Development)

- Restaurant dashboard
- Order management interface
- Admin control panel

### Technical Features

- Real-time cart synchronization using Supabase
- Responsive UI with SASS/SCSS
- Client-side routing with React Router v7
- Context-based state management (Auth, Cart, Customer)
- Toast notifications for user feedback
- Image optimization and lazy loading
- Duplicate cart item consolidation
- Custom webpack configuration with Babel

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
  - Row Level Security (RLS)
- **Node.js** - Runtime for payment server
- **Express 5.1.0** - Web framework for payment endpoints
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables management

### Development Tools

- **react-app-rewired 2.2.1** - Override create-react-app config
- **customize-cra 1.0.0** - Customize webpack configuration
- **babel-plugin-module-resolver 5.0.2** - Custom import paths
- **Jest & React Testing Library** - Testing framework

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
- Payment callbacks and webhooks
- Payment status queries
- Secure signature generation

**Why this approach?**

- Supabase provides secure, scalable backend with Row Level Security
- Payment processing requires server-side signature generation
- Reduces backend complexity for most operations
- Real-time capabilities built into Supabase

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
│   │   └── Components/
│   │       ├── Customer/     # Customer-facing layouts
│   │       │   ├── DefaultLayout/
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
│   │   │   ├── AllOrders/
│   │   │   ├── OrderDetail/
│   │   │   ├── PaymentSuccess/
│   │   │   ├── Login/
│   │   │   └── Registry/
│   │   ├── Restaurant/       # Restaurant management (in development)
│   │   └── Admin/            # Admin panel (in development)
│   │
│   ├── Routes/               # Route definitions
│   │   └── index.js          # Public and private routes
│   │
│   ├── App.js                # Root component with providers
│   ├── index.js              # Application entry point
│   └── setupTests.js         # Test configuration
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
│   └── package.json          # Server dependencies
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
git clone https://github.com/yourusername/FE_Restaurant.git
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

Create a `.env` file in the `server` directory:

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
MOMO_REDIRECT_URL=http://localhost:3000/payment/return
MOMO_IPN_URL=http://localhost:5000/api/momo/ipn
```

**How to get MoMo credentials:**

1. Register for MoMo Business account
2. Contact MoMo to get test credentials
3. For production, complete business verification

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

#### Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:

- Frontend at [http://localhost:3000](http://localhost:3000)
- Backend at [http://localhost:5000](http://localhost:5000)

#### Or run them separately:

**Frontend only:**

```bash
npm start
```

**Backend only:**

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

| Script           | Command                  | Description                         |
| ---------------- | ------------------------ | ----------------------------------- |
| `npm start`      | Start development server | Runs app at http://localhost:3000   |
| `npm run build`  | Build for production     | Creates optimized build in `build/` |
| `npm test`       | Run tests                | Launches test runner in watch mode  |
| `npm run eject`  | Eject from CRA           | **Warning: One-way operation!**     |
| `npm run server` | Start backend            | Starts payment server               |
| `npm run dev`    | Run full stack           | Runs both frontend and backend      |

### Backend Scripts

| Script        | Command          | Description                          |
| ------------- | ---------------- | ------------------------------------ |
| `npm start`   | Start server     | Runs server at http://localhost:5000 |
| `npm run dev` | Development mode | Runs with auto-reload on changes     |

## Key Features Implementation

### Context Providers

The app uses React Context API for global state management:

**AuthProvider** (`src/Api/Auth.js`)

- Manages user authentication state
- Provides login/logout functions
- Password change functionality

**CartProvider** (`src/Api/Cart.js`)

- Real-time cart synchronization with Supabase
- Add, remove, update cart items
- Automatic duplicate consolidation
- Cart clearing after order placement

**CustomerProvider** (`src/Api/Customer.js`)

- Customer profile management
- User registration
- Profile updates

### Routing

**Public Routes** (accessible to all):

- `/` - Menu page
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/login` - Login page
- `/registry` - Registration page
- `/order/:id` - Order details
- `/profile` - User profile (requires auth)
- `/createorder` - Checkout page (requires auth)
- `/payment/success` - Payment success
- `/payment/return` - Payment callback

**Private Routes** (restricted):

- `/restaurant` - Restaurant dashboard
- `/admin` - Admin panel

### Payment Integration

**Payment Flow:**

1. Customer completes order form
2. Frontend calls `createOrder()` to save order in database
3. Frontend calls `createMomoPayment()` to backend server
4. Backend generates secure signature and requests payment URL from MoMo
5. User is redirected to MoMo payment page
6. After payment, MoMo redirects user back and sends IPN to server
7. Server updates payment status in database
8. User sees confirmation page

**Security Features:**

- HMAC SHA256 signature verification
- Server-side secret key storage
- IPN callback verification
- Payment status validation

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [MoMo](https://momo.vn) - Payment gateway
- [React](https://react.dev) - Frontend framework
- [React Router](https://reactrouter.com) - Routing library

## Support

For issues and questions:

- Open an issue on GitHub
- Email: your-email@example.com

## Authors

- Your Name - Initial work

---

Made with love by [Your Name]
