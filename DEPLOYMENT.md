# EazyMyTiffin - Deployment & Setup Checklist

## ✅ What's Built

### Customer App
- ✅ Sign-in/Sign-up pages (Clerk)
- ✅ Home dashboard
- ✅ Orders management
- ✅ Subscription plans (Veg, Non-Veg, Mix)
- ✅ Profile management

### Admin Dashboard
- ✅ Overview stats
- ✅ Orders management
- ✅ Users management
- ✅ Meals management (add/delete)
- ✅ Delivery tracking

### Backend
- ✅ Clerk authentication integration
- ✅ Supabase database setup
- ✅ Clerk webhook for user sync
- ✅ Protected routes with middleware

---

## 📋 Your TODO

### 1. **Supabase Setup** (5 mins)
- Go to [Supabase Console](https://app.supabase.com)
- Create new project or use existing
- Copy your credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Run all SQL queries from `SUPABASE_SETUP.md`
- Insert admin users with actual Clerk IDs

### 2. **Clerk Setup** (5 mins)
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Get your keys:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`
- Add webhook:
  - URL: `https://YOUR_DOMAIN/api/webhooks/clerk`
  - Events: `user.created`, `user.deleted`

### 3. **Vercel Deployment** (2 mins)
```bash
# Connect to Vercel
vercel login
vercel link

# Deploy
vercel env add # Add all env vars
vercel deploy --prod
```

### 4. **.env.local Setup** (Already done)
File: `d:\FQS\EMT\.env.local`
Contains: All Clerk and Supabase keys

### 5. **Clerk Webhook Update** (After Vercel deploy)
- Update webhook URL in Clerk dashboard to production URL
- Test: Create new user account → should appear in Supabase

---

## 🚀 Running Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### Test Accounts
- Customer: Sign up new account
- Admin: Use predefined emails:
  - `eazygrace.ventures@gmail.com`
  - `abrmkprm@gmail.com`

---

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Customers, delivery boys, admins |
| `subscriptions` | Monthly/weekly meal plans |
| `orders` | Customer orders |
| `meals` | Menu items |
| `deliveries` | Delivery tracking |

---

## 🔐 Authentication Flow

1. User signs up via Clerk
2. Webhook triggers → creates user in Supabase
3. Middleware checks Clerk session
4. Admin check looks at `users.role` in Supabase

---

## 📌 Important Notes

- Clerk cards styled with EMT colors (Red #E8392A, Green #1B5E30)
- Admin emails hardcoded (update in Supabase after signup)
- All data flows through Supabase (no mock data)
- Webhook syncs Clerk users to Supabase
- Routes protected: /home, /orders, /subscription, /profile, /admin/*

---

## 🎯 Next Steps

1. ✅ Finish Supabase tables + add admin users
2. ✅ Add Clerk webhook secret to .env
3. ✅ Deploy to Vercel
4. ✅ Test sign-in → Should redirect to /home
5. ✅ Test admin login with predefined emails
6. ✅ Add meals in admin panel
7. ✅ Create test orders

---

**Questions?** Check SUPABASE_SETUP.md and Clerk docs!
