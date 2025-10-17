# 🍔 FoodFast - Food Delivery App

A complete food delivery application built with React Native, Expo, and Supabase.

## ✨ Features

- 🔐 User Authentication (Login, Signup, Password Reset)
- 🛒 Shopping Cart with real-time updates
- 📱 Browse menu by categories
- 🔍 Search products
- 💳 MoMo Payment Gateway integration
- 📦 Order history with filters
- 📍 Multiple delivery addresses
- 👤 Profile management
- ⏰ Future-only time picker for delivery

## 🛠️ Tech Stack

- React Native 0.81.4 + Expo SDK 54
- TypeScript 5.9.2
- Supabase (PostgreSQL + Auth)
- MoMo Payment Gateway (Sandbox)
- Expo Router

## 📦 Installation

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Run these SQL files in order:
     1. `fastfood.sql` - Create tables and sample data
     2. `update_customer_table.sql` - Update customer schema
     3. `create_addresses_table.sql` - Create addresses table
   - Create `.env` file with your credentials

3. **Start the app**
   ```bash
   npm start
   ```

## 📱 App Structure

```
app/
├── (tabs)/          # Home & Explore
├── feed/            # Auth screens (Login, Signup, Profile)
├── screen/          # Menu, Checkout, Payment
└── context/         # Cart state management

services/
├── supabaseClient.ts
├── orderService.ts
├── paymentService.ts   # MoMo integration
└── menuService.ts
```

## 🔐 Database Setup

After creating Supabase project, run these SQL scripts in order:

1. **fastfood.sql** - Base schema (category, product, customer, orders, etc.)
2. **update_customer_table.sql** - Add phone_number, email, date_of_birth fields
3. **create_addresses_table.sql** - Multiple delivery addresses support

## 💳 MoMo Payment (Sandbox)

- Stores amounts in **USD** in database
- Auto-converts to **VND** for MoMo API (rate: 23,000)
- Uses HMAC-SHA256 signature via crypto-js
- Test on mobile (web has CORS issues)

## 🎨 Design

- Orange theme (#FF6B35)
- Light yellow inputs (#FFE5B4)
- Rounded buttons with shadows
- Bottom sheet modals

## 📄 Environment Variables

Create `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 👨‍💻 Author

**Ngct253** - [GitHub](https://github.com/Ngct253)

## 📝 License

MIT License

---

## Learn more about Expo

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
