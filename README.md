
## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Run these SQL files in order:
     1. `fastfood.sql` - Create tables and sample data
        
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

##  MoMo Payment (Sandbox)

- Uses HMAC-SHA256 signature via crypto-js
- Test on mobile (web has CORS issues)


```

