# FE_Mobile

## Overview

A cross-platform mobile food delivery application built with React Native and Expo Router. The app provides a complete food ordering experience with user authentication, menu browsing, cart management, MoMo payment integration, and order tracking.

## Installation

Clone the repository and switch to the `mobile` branch:


```bash
### Option 1: Clone the repo and then checkout the mobile branch
git clone https://github.com/hey129/FE_Restaurant.git
cd FE_Restaurant
git checkout mobile
```

```bash
### Option 2: Clone and checkout the mobile branch in one command

git clone -b mobile https://github.com/hey129/FE_Restaurant.git

cd FE_Restaurant
```

## Configuration

### Environment Variables

Copy the template file to create your `.env`:

```bash
cp .env.example .env
```

Then update with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Open SQL Editor in Supabase Dashboard
3. Run the `fastfood.sql` script to create the database schema
4. Copy your Project URL and Anon Key from Project Settings to `.env`

## Architecture

```
app/
├── (tabs)/          # Tab navigation (Home, Orders, Profile)
├── auth/            # Authentication screens (Login, Signup, Onboarding)
├── screen/          # Feature screens (Menu, Checkout, Payment, Edit Profile)
└── context/         # React Context (Cart state management)

components/          # Reusable UI components
├── auth/           # Authentication components
├── cart/           # Shopping cart components
├── checkout/       # Checkout flow components
├── menu/           # Menu display components
├── orders/         # Order tracking components
└── profile/        # Profile management components

services/           # API integration layer
├── supabaseClient.ts    # Supabase client configuration
├── menuService.ts       # Menu data operations
├── orderService.ts      # Order management
├── paymentService.ts    # MoMo payment integration
└── profileService.ts    # User profile operations

hooks/              # Custom React hooks
├── use-cart-data.ts     # Cart state management
├── use-menu-data.ts     # Menu data fetching
├── use-pagination.ts    # Pagination logic
└── use-debounce.ts      # Search debouncing

constants/          # App constants and theme configuration
utils/              # Utility functions and validation
```

### Database Schema

- `category`, `product` - Food menu and categories
- `customer` - User profiles (linked to auth.users)
- `cart` - Shopping cart items
- `orders`, `order_detail` - Order records and line items
- `payment` - Payment transaction records

### Payment Flow

1. User selects items and proceeds to checkout
2. App generates HMAC-SHA256 signature for request validation
3. Sends payment request to MoMo Sandbox API
4. Receives `payUrl` and redirects to MoMo payment gateway
5. User completes payment in MoMo app/browser
6. MoMo redirects back via deep link (`fooddeliveryapp://payment-result`)
7. App updates order status in database

## Features

### Customer Features

- **Authentication**

  - Email/password registration and login
  - Onboarding flow for new users
  - Profile management (name, phone, address)
  - Password change functionality
- **Menu & Product Browsing**

  - Browse food items by category
  - Product details with images, descriptions, ratings, and prices
  - Search functionality with debouncing
  - Pagination support
- **Shopping Cart**

  - Add/remove/update product quantities
  - Automatic total calculation
  - Cart persistence per user
  - Clear cart functionality
- **Checkout & Payment**

  - MoMo payment gateway integration (Sandbox)
  - Delivery address and time selection
  - Order summary review
  - HMAC-SHA256 secure payment signing
- **Order Management**

  - Order history tracking
  - Real-time order status (pending, preparing, delivered, cancelled)
  - Order detail view with item breakdown
- **UI/UX**

  - Bottom tab navigation
  - Smooth animations with Reanimated
  - Responsive design for various screen sizes

## Tech Stack

### Frontend

- **React Native** 0.81.4 - Cross-platform mobile framework
- **Expo SDK** 54 - Development platform and tools
- **Expo Router** 6.0 - File-based routing and navigation
- **TypeScript** 5.9 - Type-safe development
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch gesture handling
- **React Native Modal** - Modal components

### Backend Services

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (email/password)
  - Row Level Security (RLS)
  - Real-time subscriptions
- **MoMo Payment Gateway** - Payment processing (Sandbox environment)

### Development Tools

- **Expo CLI** - Development server and build tools
- **ESLint** - Code linting

## Running the Application

### Development Server

```bash
npm start
```

Choose your platform:

- Press `a` to open Android emulator
- Press `i` to open iOS simulator
- Press `w` to open web browser
- Scan QR code with Expo Go app on physical device
