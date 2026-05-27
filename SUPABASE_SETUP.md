# Supabase Database Setup

## Complete Setup Instructions

### 1. Copy All SQL from db.sql

Go to `d:\FQS\EMT\db\db.sql` and copy all the SQL code.

### 2. Run in Supabase SQL Editor

1. Go to [Supabase Console](https://app.supabase.com) → Select Project
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste entire `db.sql` content
5. Click **RUN**

The script will:
- ✅ Create all extensions
- ✅ Create all enums
- ✅ Create all 12 tables with relationships
- ✅ Create indexes for performance
- ✅ Set up RLS (Row Level Security) policies
- ✅ Enable realtime for orders, subscriptions, deliveries, notifications
- ✅ Create storage buckets (profile-images, menu-images, delivery-proofs)
- ✅ Create helper functions

---

## Admin Users Setup

After tables are created, go to **SQL Editor** and run:

```sql
-- Insert admin users
INSERT INTO public.users (
  clerk_user_id,
  full_name,
  email,
  phone,
  role,
  is_phone_verified
) VALUES
(
  'clerk_admin_1',
  'Admin One',
  'eazygrace.ventures@gmail.com',
  '9770144899',
  'admin',
  TRUE
),
(
  'clerk_admin_2',
  'Admin Two',
  'abrmkprm@gmail.com',
  '9999999999',
  'admin',
  TRUE
);
```

**Important:** Replace `clerk_admin_1` and `clerk_admin_2` with actual Clerk user IDs:
1. Sign up with admin emails in your app
2. Get user IDs from Clerk Dashboard (https://dashboard.clerk.com)
3. Copy-paste them into the SQL query

---

## Sample Data (Optional)

### Add Subscription Plans
```sql
INSERT INTO public.subscription_plans (
  title,
  description,
  meal_type,
  category,
  duration_days,
  price,
  is_trial,
  is_active
) VALUES
('Veg Weekly', 'Pure vegetarian meals', 'both', 'veg', 7, 560, FALSE, TRUE),
('Non-Veg Weekly', 'Chicken & meat specials', 'both', 'non_veg', 7, 700, FALSE, TRUE),
('Veg Monthly', 'Monthly veg plan', 'both', 'veg', 26, 2490, FALSE, TRUE),
('Non-Veg Monthly', 'Monthly non-veg plan', 'both', 'non_veg', 26, 3490, FALSE, TRUE);
```

### Add Menus
```sql
INSERT INTO public.menus (
  title,
  description,
  category,
  meal_type,
  is_active
) VALUES
('Paneer Tikka', 'Marinated paneer with spices', 'veg', 'lunch', TRUE),
('Butter Chicken', 'Creamy chicken curry', 'non_veg', 'lunch', TRUE),
('Dal Rice', 'Basmati rice with lentils', 'veg', 'both', TRUE),
('Fish Curry', 'Bengali style fish curry', 'non_veg', 'dinner', TRUE);
```

---

## Verify Setup

After running db.sql:

1. **Check Tables** → SQL Editor → Run:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

2. **Check Enums** → SQL Editor → Run:
```sql
SELECT typname FROM pg_type 
WHERE typtype = 'e'
ORDER BY typname;
```

3. **Check Storage Buckets** → Go to **Storage** tab
   - Should see: `profile-images`, `menu-images`, `delivery-proofs`

---

## Database Schema Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | Customers, admins, delivery boys | role, status, is_phone_verified |
| `addresses` | Delivery addresses | type (home/hostel/office), is_default |
| `subscriptions` | Active meal subscriptions | plan_id, category, status, remaining_days |
| `menus` | Food items | category (veg/non_veg), meal_type (lunch/dinner/both) |
| `food_orders` | Customer orders | status, payment_status, payment_method |
| `delivery_assignments` | Delivery tracking | delivery_boy_id, status, proof_image |
| `payments` | Payment records | payment_method, payment_status, amount |
| `notifications` | User notifications | type, channel (in_app/email/whatsapp) |
| `admin_logs` | Admin action logs | action, entity, metadata |

---

## Realtime Features

The following tables are enabled for realtime:
- ✅ `subscriptions` - Live subscription updates
- ✅ `food_orders` - Live order tracking
- ✅ `delivery_assignments` - Live delivery tracking
- ✅ `notifications` - Live notifications

Subscribe to updates in your app:
```typescript
supabase
  .channel('food_orders')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'food_orders' },
    (payload) => {
      console.log('Order updated:', payload.new);
    }
  )
  .subscribe();
```

---

## Troubleshooting

**Error: "Extension uuid-ossp does not exist"**
- This is normal if Supabase already has it. Ignore and continue.

**Error: "Type already exists"**
- Run the script again or create in a fresh project.

**Admin login not working?**
- Make sure Clerk IDs match. Verify:
  1. Admin signed up with email
  2. Copied exact Clerk ID
  3. Updated SQL query
  4. Run insert query again

---

## Next: Clerk Webhook Integration

After database setup:

1. Add to `.env.local`:
```
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

2. In Clerk Dashboard:
   - Go to **Webhooks**
   - Add endpoint: `https://YOUR_DOMAIN/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.deleted`

---

**Done!** Database is ready. Move to DEPLOYMENT.md
