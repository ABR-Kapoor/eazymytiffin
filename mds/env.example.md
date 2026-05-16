# EazyMyTiffin — ENV Example Document

# 1. Overview

This document defines all required environment variables for EazyMyTiffin.

Environment variables are grouped by:

* frontend
* backend
* authentication
* payments
* notifications
* realtime services
* deployment

---

# 2. Next.js Environment Variables

```env
# =====================================================
# APP
# =====================================================
NEXT_PUBLIC_APP_NAME=EazyMyTiffin
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

# =====================================================
# SUPABASE
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# =====================================================
# CLERK AUTH
# =====================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# =====================================================
# FIREBASE OTP AUTH
# =====================================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# =====================================================
# PHONEPE PAYMENT GATEWAY
# =====================================================
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=
PHONEPE_BASE_URL=
PHONEPE_CALLBACK_URL=

# =====================================================
# RESEND EMAIL
# =====================================================
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# =====================================================
# WIREWEB WHATSAPP
# =====================================================
WIREWEB_API_KEY=
WIREWEB_INSTANCE_ID=
WIREWEB_BASE_URL=

# =====================================================
# STORAGE
# =====================================================
NEXT_PUBLIC_PROFILE_BUCKET=profile-images
NEXT_PUBLIC_MENU_BUCKET=menu-images
NEXT_PUBLIC_DELIVERY_BUCKET=delivery-proofs

# =====================================================
# CRON SECRET
# =====================================================
CRON_SECRET_KEY=

# =====================================================
# ADMIN
# =====================================================
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PHONE=

# =====================================================
# ANALYTICS
# =====================================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# =====================================================
# PWA
# =====================================================
NEXT_PUBLIC_ENABLE_PWA=true

# =====================================================
# VERCEL
# =====================================================
VERCEL_ENV=
```

---

# 3. Environment Types

## Development

Purpose:

* local development
* testing APIs
* staging integrations

---

## Staging

Purpose:

* production-like testing
* QA validation
* payment testing

---

## Production

Purpose:

* live customers
* realtime operations
* payments
* delivery management

---

# 4. Security Rules

## Never Expose

Never expose:

* service role keys
* secret keys
* payment salts
* cron secrets

on frontend.

---

## Public Variables

Only NEXT_PUBLIC variables:

* accessible on frontend
* bundled client-side

---

# 5. Deployment Rules

## Local Development

Use:

* .env.local

---

## Production Deployment

Store variables in:

* Vercel Environment Settings

---

# 6. Recommended Environment Setup Flow

```text
Create Supabase Project
→ Configure Clerk
→ Configure Firebase
→ Configure PhonePe
→ Configure Resend
→ Configure WireWeb
→ Add Variables to Vercel
→ Test Realtime
→ Test Payments
→ Deploy Production
```

---

# 7. Validation Checklist

Before deployment validate:

* Supabase connection
* Clerk auth
* Firebase OTP
* PhonePe callbacks
* Resend email delivery
* WireWeb WhatsApp delivery
* Realtime subscriptions
* Storage uploads

---

# End of ENV Example Document
