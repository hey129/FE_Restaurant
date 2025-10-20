# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

---

# FoodFast - Food Delivery App

A food delivery application built with React Native, Expo, and Supabase.

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Ngct253/FoodDeliveryApp.git
   cd FoodDeliveryApp
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup Supabase
   - Create a project at [supabase.com](https://supabase.com)
   - Run SQL file: `fastfood.sql` in Supabase SQL Editor
   - Copy `.env.example` to `.env` and update with your Supabase credentials:
     ```bash
     cp .env.example .env
     ```
     Then edit [.env](http://_vscodecontentref_/0):
     ```env
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the app
   ```bash
   npm start
   ```

## Project Structure

```
app/
├── (tabs)/              # Main tabs
│   ├── index.tsx        # Home tab
│   ├── orders.tsx       # Orders tab
│   ├── profile.tsx      # Profile tab
│   └── _layout.tsx      # Tab navigation layout
├── feed/                # Authentication screens
│   ├── _welcome.tsx     # Welcome screen
│   ├── _login.tsx       # Login screen
│   ├── _signup.tsx      # Signup screen
│   └── _onboarding.tsx  # Onboarding screen
├── screen/              # Other screens
│   ├── menu.tsx         # Menu screen
│   ├── productDetail.tsx # Product detail
│   ├── checkout.tsx     # Checkout screen
│   ├── payment.tsx      # Payment screen
│   ├── editProfile.tsx  # Edit profile
│   └── changePassword.tsx # Change password
├── context/
│   └── _cartContext.tsx # Cart state management
├── modal.tsx            # Modal example (theme support)
└── _layout.tsx          # Root layout

components/
├── auth/                # Authentication UI
│   ├── authButton.tsx
│   ├── authHeader.tsx
│   ├── authInput.tsx
│   └── index.ts
├── cart/                # Cart components
│   ├── cart.tsx
│   ├── cartItem.tsx
│   ├── cartSummary.tsx
│   ├── emptyCart.tsx
│   └── index.ts
├── checkout/            # Checkout components
│   ├── addressForm.tsx
│   ├── deliveryTimePicker.tsx
│   ├── orderSummary.tsx
│   └── index.ts
├── menu/
│   └── menu.tsx         # Menu list component
├── orders/              # Order components
│   ├── orderCard.tsx
│   ├── orderTabs.tsx
│   ├── emptyOrders.tsx
│   └── index.ts
├── profile/             # Profile components
│   ├── profileHeader.tsx
│   ├── profileField.tsx
│   ├── profileButton.tsx
│   ├── profileInput.tsx
│   └── index.ts
├── account/
│   └── accountModal.tsx # Account settings modal
├── themed-text.tsx      # Theme-aware text component
└── themed-view.tsx      # Theme-aware view component

services/
├── supabaseClient.ts    # Supabase configuration
├── menuService.ts       # Menu data fetching
├── orderService.ts      # Order CRUD operations
└── paymentService.ts    # MoMo payment integration

hooks/
├── use-debounce.ts      # Debounce hook
├── use-filtered-items.ts # Filter items hook
├── use-menu-data.ts     # Menu data fetching hook
├── use-pagination.ts    # Pagination hook
├── use-color-scheme.ts  # Color scheme hook
└── use-theme-color.ts   # Theme color hook

constants/
├── app.ts               # App constants (COLORS)
├── endpoints.ts         # API endpoints
├── sharedStyles.ts      # Shared styles
└── theme.ts             # Theme colors (light/dark)

utils/
└── validation.ts        # Form validation utilities
```

## Database Schema

Run `fastfood.sql` in Supabase SQL Editor. This creates:

- `category` - Product categories
- `product` - Menu items
- `customer` - User profiles
- `orders` - Order information
- `order_detail` - Order items
- `payment` - Payment records
- `cart` - Shopping cart

## MoMo Payment Integration

Payment gateway using MoMo Sandbox API with HMAC-SHA256 signature.

- Currency: VND
- Platform: Mobile (expo-linking) and Web (expo-web-browser)
- Config: `services/paymentService.ts`

## Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web browser
```

---

## Learn more about Expo

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
