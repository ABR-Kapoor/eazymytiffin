# EazyMyTiffin — System Architecture Document

# 1. Overview

EazyMyTiffin is a subscription-first tiffin and food delivery platform designed for students and working professionals.

The platform architecture focuses on:

* realtime responsiveness
* subscription management
* operational simplicity
* mobile-first customer experience
* scalable SaaS-ready backend architecture

The system supports:

* customer application
* admin dashboard
* delivery boy dashboard
* landing website
* realtime delivery tracking
* WhatsApp retention workflows
* PWA installation

---

# 2. Core Architectural Principles

## 2.1 Mobile First Customer Experience

Customer application must:

* feel lightweight
* load quickly
* behave close to native app
* support PWA installation
* prioritize touch interactions

---

## 2.2 Desktop First Admin Experience

Admin dashboard must:

* optimize operational workflows
* support large datasets
* prioritize realtime monitoring
* use table-based management systems

---

## 2.3 Realtime Driven Architecture

Realtime communication is a primary architectural requirement.

Realtime systems include:

* delivery tracking
* order status updates
* subscription updates
* dashboard activity
* notifications

Implemented using:

* Supabase Realtime

---

## 2.4 Modular System Design

The architecture separates concerns into independent modules.

Benefits:

* easier scaling
* feature isolation
* maintainability
* future multi-city expansion

---

# 3. High Level Architecture

```text
┌──────────────────────┐
│      Client Apps     │
├──────────────────────┤
│ Customer PWA         │
│ Admin Dashboard      │
│ Delivery Dashboard   │
│ Landing Website      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Next.js App     │
├──────────────────────┤
│ App Router           │
│ API Routes           │
│ Server Actions       │
│ Middleware           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Supabase        │
├──────────────────────┤
│ PostgreSQL           │
│ Realtime             │
│ Storage              │
│ Edge Functions       │
│ RLS Policies         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ External Services    │
├──────────────────────┤
│ Clerk Auth           │
│ Firebase OTP         │
│ PhonePe              │
│ Resend               │
│ WireWeb              │
└──────────────────────┘
```

---

# 4. Frontend Architecture

# 4.1 Frontend Stack

## Core Stack

* Next.js
* TypeScript
* Tailwind CSS
* Zustand
* PWA

---

## Frontend Priorities

Priority order:

1. Realtime smoothness
2. Fast loading
3. Mobile responsiveness
4. SEO optimization
5. Subtle animations

---

# 4.2 Frontend Application Structure

```text
/app
/components
/modules
/hooks
/store
/services
/lib
/utils
/types
/styles
/constants
```

---

# 4.3 App Router Structure

```text
/app
  /(public)
    /
    /about
    /contact

  /(auth)
    /login
    /verify-phone

  /(customer)
    /home
    /tiffin
    /food-delivery
    /orders
    /profile

  /(admin)
    /dashboard
    /subscriptions
    /orders
    /users
    /analytics

  /(delivery)
    /deliveries
```

---

# 4.4 Component Architecture

## Shared Components

Reusable UI:

* buttons
* cards
* modals
* tables
* chips
* loaders
* dropdowns
* alerts
* forms

---

## Module Components

Each feature module contains:

* feature UI
* hooks
* services
* store slices
* utility functions

---

# 4.5 UI Design System

## Design Philosophy

UI should feel:

* warm
* premium minimal
* clean
* soft rounded
* modern but human

---

## Customer UI

Customer application uses:

* cards
* timelines
* bottom navigation
* sticky actions
* minimal data density

---

## Admin UI

Admin dashboard uses:

* dense tables
* operational widgets
* charts
* quick actions
* bulk operations

---

# 5. State Management Architecture

# 5.1 Zustand Architecture

Zustand manages:

* auth state
* subscriptions
* notifications
* delivery state
* cart state
* dashboard state

---

# 5.2 Store Separation

## Auth Store

Stores:

* session
* user role
* verification status
* blocked status

---

## Subscription Store

Stores:

* active subscription
* remaining days
* renewal state
* pause state

---

## Order Store

Stores:

* cart
* order lifecycle
* delivery tracking
* ETA

---

## Notification Store

Stores:

* notification list
* unread count
* realtime notification updates

---

## Admin Store

Stores:

* dashboard analytics
* operational state
* filters
* realtime activities

---

# 5.3 Realtime State Handling

Realtime updates should:

* merge incrementally
* avoid full reloads
* preserve optimistic UI
* minimize rerenders

---

# 6. Backend Architecture

# 6.1 Backend Stack

Using:

* Supabase PostgreSQL
* Supabase Realtime
* Supabase Storage
* Supabase Edge Functions

---

# 6.2 Backend Responsibilities

Backend manages:

* authentication sync
* subscriptions
* orders
* realtime updates
* delivery tracking
* notifications
* payment records
* admin operations

---

# 6.3 API Layer Strategy

Use:

* Next.js Server Actions
* API Route Handlers
* Supabase Client SDK

---

# 6.4 Server Responsibilities

Server layer responsible for:

* validation
* authorization
* payment verification
* protected actions
* admin checks
* realtime event triggers

---

# 7. Authentication Architecture

# 7.1 Authentication Stack

## Google Login

Using:

* Clerk

---

## OTP Verification

Using:

* Firebase OTP Authentication

---

# 7.2 Authentication Flow

```text
Landing Page
→ Google Login
→ Phone Verification
→ User Sync
→ Access Application
```

---

# 7.3 User Sync Flow

After successful authentication:

* Clerk user synced with Supabase users table
* verification state updated
* role attached

---

# 7.4 Protected Route Strategy

Middleware validates:

* session
* verification state
* user role
* blocked status

---

# 8. Database Architecture

# 8.1 Database Philosophy

Database designed for:

* operational scalability
* realtime responsiveness
* future multi-city support
* subscription lifecycle tracking

---

# 8.2 Core Tables

Core entities:

* users
* addresses
* subscriptions
* menus
* food_orders
* delivery_assignments
* notifications
* payments
* admin_logs

---

# 8.3 Relationship Design

Relationships optimized for:

* fast querying
* realtime updates
* analytics aggregation
* operational filtering

---

# 8.4 Database Priorities

Priority areas:

* subscription tracking
* realtime delivery states
* audit logs
* operational filtering

---

# 9. Realtime Architecture

# 9.1 Realtime Philosophy

Realtime is critical for:

* delivery transparency
* admin monitoring
* operational responsiveness
* customer trust

---

# 9.2 Realtime Channels

## Customer Channels

```text
user:{id}
subscription:{id}
order:{id}
```

---

## Admin Channels

```text
admin:dashboard
admin:subscriptions
admin:deliveries
```

---

## Delivery Channels

```text
delivery:{id}
assignment:{id}
```

---

# 9.3 Realtime Events

Realtime updates include:

* delivery status
* ETA updates
* pause/resume changes
* payment confirmations
* admin operational updates

---

# 9.4 Realtime Optimization

Realtime system should:

* avoid large payloads
* update partial state
* debounce heavy events
* reduce unnecessary subscriptions

---

# 10. Storage Architecture

# 10.1 Storage Buckets

## profile-images

Stores:

* customer profile photos
* delivery boy profile photos

---

## menu-images

Stores:

* food images
* menu previews

---

## delivery-proofs

Stores:

* delivery confirmation images

---

# 10.2 Storage Rules

Storage should:

* use public URLs where required
* compress uploads
* optimize image sizes
* separate buckets logically

---

# 11. Subscription Architecture

# 11.1 Subscription Philosophy

The subscription engine is:

* meal-day based
* retention-focused
* operationally simple

---

# 11.2 Subscription Logic

Meal deductions occur:

* when meal enters preparation state

---

# 11.3 Pause & Resume Architecture

Pause system:

* validates cutoff time
* skips meal deduction
* extends expiry automatically
* triggers notifications

---

# 11.4 Renewal System

Renewal reminders:

* 7 days remaining
* 3 days remaining

Channels:

* in-app
* WhatsApp

---

# 12. Order Architecture

# 12.1 Food Order Flow

```text
Create Order
→ Payment
→ Preparing
→ Assigned
→ Out for Delivery
→ Delivered
```

---

# 12.2 Order States

Supported states:

* pending
* preparing
* assigned
* out_for_delivery
* delivered
* cancelled

---

# 12.3 COD Architecture

COD payments:

* remain pending
* require admin verification

---

# 13. Delivery Architecture

# 13.1 Delivery Philosophy

Delivery system prioritizes:

* simplicity
* realtime transparency
* low operational overhead

---

# 13.2 Delivery Tracking

Customer sees:

* delivery boy image
* name
* phone
* ETA
* status

---

# 13.3 ETA System

ETA updated manually using:

* predefined dropdown values

---

# 13.4 Delivery Proof System

Delivery completion requires:

* proof image upload
* status update

---

# 14. Notification Architecture

# 14.1 Notification Channels

Supported:

* in-app
* email
* WhatsApp

---

# 14.2 Email Notifications

Using:

* Resend

Used for:

* payment success
* invoices
* delivery completion

---

# 14.3 WhatsApp Notifications

Using:

* WireWeb

Used for:

* renewals
* delivery updates
* trial conversion reminders

---

# 15. Payment Architecture

# 15.1 Payment Methods

Supported:

* PhonePe
* COD

---

# 15.2 Payment Flow

```text
Create Order
→ Initialize Payment
→ Verify Payment
→ Save Transaction
→ Trigger Notifications
```

---

# 15.3 Payment Failure Handling

If payment fails:

* revert order
* notify customer
* show retry CTA

---

# 16. Admin Architecture

# 16.1 Admin Responsibilities

Admin controls:

* subscriptions
* users
* deliveries
* payments
* menus
* analytics

---

# 16.2 Admin Features

Includes:

* bulk actions
* realtime dashboard
* analytics
* operational tables
* audit logs

---

# 16.3 Admin Security

Admin routes require:

* server validation
* role verification
* protected middleware

---

# 17. PWA Architecture

# 17.1 PWA Goals

PWA should:

* feel native
* support installation
* load fast
* support mobile workflows

---

# 17.2 PWA Requirements

Includes:

* manifest
* service worker
* install prompts
* optimized caching

---

# 18. Security Architecture

# 18.1 Security Priorities

* OTP verification
* duplicate prevention
* protected routes
* RLS policies
* admin protection

---

# 18.2 Trial Abuse Prevention

Prevent:

* duplicate phone usage
* repeated trial claims
* multiple account abuse

---

# 18.3 Database Security

Use:

* Row Level Security
* protected functions
* role-based policies

---

# 19. Deployment Architecture

# 19.1 Hosting Stack

Frontend:

* Vercel

Backend:

* Supabase

---

# 19.2 Environment Structure

Required environments:

* development
* staging
* production

---

# 19.3 Environment Variables

Required:

* Clerk keys
* Supabase URL
* Supabase anon key
* Firebase credentials
* PhonePe keys
* Resend keys
* WireWeb keys

---

# 20. Scalability Architecture

# 20.1 Future Multi-City Support

Architecture prepared for:

* city-level filtering
* operational separation
* city-specific menus
* city analytics

---

# 20.2 Future Multi-Kitchen Support

Future support:

* kitchen IDs
* kitchen allocation
* regional operations

---

# 20.3 Future Features

Prepared architecture for:

* referral system
* coupon engine
* AI recommendations
* smart reorder
* vendor onboarding
* route optimization

---

# 21. Performance Architecture

# 21.1 Performance Priorities

Priority order:

1. Realtime smoothness
2. Fast loading
3. SEO optimization
4. Animation smoothness

---

# 21.2 Optimization Strategies

Use:

* lazy loading
* server rendering
* optimized queries
* image optimization
* incremental state updates

---

# 22. Logging & Monitoring

# 22.1 Audit Logging

Track:

* admin actions
* payment changes
* subscription edits
* delivery assignments

---

# 22.2 Error Monitoring

Monitor:

* payment failures
* realtime failures
* notification failures
* auth synchronization issues

---

# 23. Engineering Philosophy

The engineering architecture prioritizes:

* modularity
* scalability
* maintainability
* operational simplicity
* realtime responsiveness
* developer productivity

---

# 24. Final Architectural Statement

EazyMyTiffin is architected as a realtime, subscription-first meal operations platform optimized for mobile-first customer experience, operational reliability, and future SaaS scalability.

---

# End of Architecture Document
