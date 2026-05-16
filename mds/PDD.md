# EazyMyTiffin — Product Design Document (PDD)

## Prepared For

Antigravity IDE

## Document Type

Enterprise-Level Product Design & Full Stack Architecture Document

## Product Name

EazyMyTiffin

## Product Category

Subscription-First Tiffin & Food Delivery Platform

---

# 1. Executive Summary

EazyMyTiffin is a modern subscription-first meal delivery platform focused on students and working professionals.

The platform combines:

* Daily tiffin subscription management
* Instant food ordering
* Lightweight logistics tracking
* Realtime operational updates
* WhatsApp-assisted retention workflows
* Centralized admin operations
* Mobile-first customer experience

The product is designed initially for Bilaspur, Chhattisgarh with future scalability toward a multi-city tiffin SaaS platform.

---

# 2. Product Vision

## Vision Statement

Build a reliable, affordable, and scalable subscription meal ecosystem that simplifies daily food management for students and working professionals.

---

## Long-Term Goal

Transform EazyMyTiffin into a multi-city SaaS-enabled tiffin and food operations platform.

---

# 3. Product Positioning

## Core Positioning

"Affordable premium home-style meals for busy students and professionals."

---

## User Emotional Goals

Users should feel:

* This saves my time
* This is reliable
* This feels like home food
* This is easier than cooking
* This is student-friendly
* This is operationally smooth

---

# 4. Product Philosophy

The product prioritizes:

* operational reliability
* user retention
* realtime responsiveness
* subscription simplicity
* mobile-first usability
* low-friction workflows

The MVP intentionally avoids:

* unnecessary AI features
* complex logistics systems
* overloaded dashboards
* enterprise-heavy customer UX

---

# 5. Target Audience

## Primary User Segments

### Students

* Hostel residents
* PG residents
* Coaching students
* College students

---

### Working Professionals

* Office employees
* Bachelors living alone
* Corporate workers
* Small office teams

---

# 6. Product Modules

## 6.1 Customer Application

Features:

* Authentication
* Phone verification
* Address management
* Tiffin subscriptions
* Food ordering
* Delivery tracking
* Notifications
* Payment handling
* WhatsApp support

---

## 6.2 Admin Dashboard

Features:

* Subscription management
* Food order management
* Delivery management
* User management
* Menu management
* Revenue tracking
* Realtime operational monitoring
* Bulk operations
* Audit logs

---

## 6.3 Delivery Boy Dashboard

Features:

* Assigned deliveries
* ETA updates
* Delivery completion
* Delivery image upload
* Google Maps opening
* Customer contact

---

## 6.4 Landing Website

Features:

* SEO landing pages
* Trial meal promotion
* Subscription promotion
* Food delivery CTA
* App install CTA
* Contact support

---

# 7. Product Modes

The application contains two separate customer experiences.

## 7.1 Tiffin Subscription Mode

Focused on:

* recurring subscriptions
* meal-day management
* retention workflows
* pause/resume operations

---

## 7.2 Food Delivery Mode

Focused on:

* instant ordering
* cart system
* food browsing
* one-time purchases

---

# 8. Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Zustand
* Progressive Web App (PWA)

---

## Backend

* Supabase PostgreSQL
* Supabase Realtime
* Supabase Storage
* Supabase Edge Functions

---

## Authentication

* Clerk (Google OAuth)
* Firebase OTP Authentication

---

## Notifications

* Resend (Emails)
* WireWeb (WhatsApp Automation)

---

## Deployment

* Vercel

---

# 9. Authentication System

## Authentication Flow

```text
Landing Page
→ Google Login
→ OTP Verification
→ Profile Completion
→ Access Application
```

---

## Authentication Requirements

Every user must:

* login with Google
* verify phone number via OTP

---

## Phone Verification Rules

* phone number required
* duplicate phone numbers blocked
* same phone cannot attach to another Google account

---

## Account Recovery

Users can:

* change phone number later
* re-verify via OTP

---

# 10. Role-Based Access Control (RBAC)

## Roles

### Customer

Permissions:

* manage subscriptions
* place orders
* track deliveries
* manage addresses

---

### Delivery Boy

Permissions:

* access assigned deliveries
* update ETA
* upload delivery proof
* mark deliveries completed

Restrictions:

* no customer dashboard
* no admin dashboard

---

### Super Admin

Permissions:

* unrestricted access
* user management
* subscription management
* analytics
* delivery assignments
* operational controls

---

# 11. User Suspension Logic

## Blocked User Experience

Blocked users:

* can access landing page only
* cannot access internal application routes
* see account suspension message

---

## Delivery Boy Deactivation

If delivery role removed:

* delivery dashboard inaccessible
* user converted back to customer

---

# 12. Address Management System

## Supported Address Types

* Home
* Hostel
* Office

---

## Address Rules

* maximum 3 addresses
* one default address mandatory
* unsupported city shows "Coming Soon"

---

## Address Fields

Required:

* Google Maps link
* House/Flat Number
* Landmark
* Hostel/Company Name
* Floor
* Area
* City

---

# 13. Subscription Engine

## Subscription Architecture

The subscription engine is meal-day based.

Not calendar expiry based.

Example:

* 30 meal days remaining

---

## Meal Deduction Logic

Meal deduction occurs:

* when meal enters preparation stage

---

## Subscription Types

### Veg Subscription

### Non-Veg Subscription

---

## Subscription Plans

### Trial Plan

* one-time only
* discounted trial pricing
* user can select veg OR non-veg once

---

### Monthly Plans

* Lunch Only
* Lunch + Dinner

---

### Multi-Month Plans

* 3 Months
* 6 Months
* 12 Months

---

# 14. Trial Meal System

## Trial Logic

A user can use:

* only one trial
* either veg or non-veg
* once per verified account

---

## Validation Conditions

Validation based on:

* Google account
* verified phone number
* admin verification

---

## Trial Flow

```text
Login
→ Verify Phone
→ Select Trial
→ Complete Payment
→ Delivery Tracking
→ WhatsApp Follow-up
→ Subscription Conversion
```

---

# 15. Pause & Resume System

## Pause Rules

Lunch pause cutoff:

* before 11 AM

Dinner pause cutoff:

* before 6 PM

---

## Pause Workflow

```text
Pause Request
→ Check Cutoff Time
→ Skip Meal Deduction
→ Extend Expiry Automatically
→ Trigger Notifications
→ Update Realtime State
```

---

## Resume Workflow

```text
Resume Subscription
→ Restore Upcoming Deliveries
→ Update Meal Calendar
→ Send Confirmation
```

---

# 16. Subscription Renewal Logic

## Renewal Reminder Triggers

* 7 days remaining
* 3 days remaining

---

## Renewal Channels

* In-app notification
* WhatsApp reminder

---

## Subscription Expiry

* subscription disabled after 6 days post-expiry
* renewal allowed anytime

---

# 17. Weekly Menu System

## Menu Structure

Each meal contains:

* meal title
* image
* badges
* lunch/dinner type
* veg/non-veg category

---

## Weekly Menu Logic

* repeating weekly cycle
* admin can instantly replace menu
* updates affect all users globally

---

## Visibility Rules

### Veg Users

Can see:

* veg items only

---

### Non-Veg Users

Can see:

* veg items
* non-veg items

---

# 18. Food Delivery System

## Food Ordering Features

* separate food delivery mode
* cart system
* quantity selector
* notes support
* instant ordering

---

## Delivery Time Slots

### Lunch

12 PM – 2 PM

### Dinner

7 PM – 9 PM

---

## Order Cancellation Rules

Customers can cancel:

* only before preparation starts

---

# 19. Order Lifecycle

## Order Status Flow

```text
Pending
→ Preparing
→ Assigned
→ Out for Delivery
→ Delivered
→ Cancelled
```

---

## Payment Failure Flow

```text
Payment Failed
→ Order Reverted
→ User Notification
→ Retry Payment CTA
```

---

# 20. Delivery System

## Delivery Boy Features

Delivery boys can:

* update ETA
* upload delivery proof
* mark delivery complete
* contact customer
* open Google Maps

---

## Customer Tracking Panel

Customer can view:

* delivery boy image
* name
* phone number
* ETA
* delivery status

---

## ETA Options

Dropdown values:

* 5 mins
* 10 mins
* 15 mins
* 20 mins
* 30 mins
* Delayed

---

# 21. Notification Architecture

## In-App Notifications

Used for:

* delivery updates
* pause confirmations
* renewal reminders
* subscription updates

Notifications remain stored in history.

---

## Email Notifications

Using Resend.

Triggered for:

* payment success
* invoices
* delivery completion

Tone:

* warm homemade
* professional
* minimal

---

## WhatsApp Notifications

Using WireWeb.

Triggered for:

* renewal reminders
* trial conversion reminders
* delivery updates
* pause confirmations

---

# 22. WhatsApp Automation Workflow

## WhatsApp Actions

```text
1. Pause Subscription
2. Resume Subscription
3. Check Delivery Status
4. Renew Subscription
5. Contact Owner
```

---

## WhatsApp Flow Philosophy

The WhatsApp workflow should:

* remain lightweight
* avoid AI complexity
* focus on operational utility

---

# 23. Customer Application UX

## UX Principles

The customer experience should feel:

* lightweight
* fast
* warm
* trustworthy
* mobile-friendly

---

## UX Restrictions

Avoid:

* heavy enterprise layouts
* complex analytics
* excessive clicks
* cluttered interfaces

---

# 24. Customer Navigation Architecture

## Bottom Navigation

```text
Home
Tiffin
Food Delivery
Orders
Profile
```

---

# 25. Home Screen Architecture

## Hero Section

Contains:

* trial meal CTA
* subscription CTA
* food delivery CTA
* install app CTA

---

## Active Subscription Card

Displays:

* current plan
* remaining meal days
* next delivery
* pause CTA
* renew CTA

---

## Tomorrow Menu Preview

Displays:

* lunch preview
* dinner preview
* meal images

---

## Quick Actions

* Pause Subscription
* Resume Subscription
* Track Delivery
* Contact Owner

---

# 26. Calendar UX System

## Calendar Features

Visual indicators for:

* delivered meals
* paused meals
* inactive meals
* upcoming meals
* expiry dates

---

## Meal Indicators

Suggested:

* Green = Lunch
* Orange = Dinner
* Gray = Inactive

---

# 27. Food Delivery UX

## Dish Card Structure

Each dish card contains:

* image
* title
* price
* veg/non-veg indicator
* badges
* add-to-cart CTA

---

## Checkout Flow

```text
Cart
→ Address Selection
→ Payment Selection
→ Confirm Order
→ Payment
→ Success Screen
```

---

# 28. Delivery Tracking UX

## Delivery Experience Philosophy

The delivery tracking experience should feel:

* lightweight
* realtime
* reassuring
* operationally transparent
* simple to understand

The customer should never feel uncertain about:

* where the meal is
* who is delivering
* when it will arrive

---

## Delivery Timeline

```text
Preparing
→ Assigned
→ Out for Delivery
→ Arriving Soon
→ Delivered
```

---

## Delivery Information Panel

Displays:

* delivery boy image
* delivery boy name
* phone number
* ETA
* delivery status
* meal type

---

## ETA System

Delivery boys update ETA manually using dropdown values.

### ETA Options

* 5 mins
* 10 mins
* 15 mins
* 20 mins
* 30 mins
* Delayed

---

## Delivery Completion System

Delivery completion requires:

* delivery proof image upload
* status confirmation

Proof image stored in:

* Supabase Storage

---

## Failed Delivery States

Supported failed states:

* customer unavailable
* unreachable customer
* delayed delivery
* cancelled by admin

---

## Customer Actions During Delivery

Customer can:

* call delivery boy
* contact owner
* view ETA
* refresh status manually

---

## Delivery Boy Workflow

```text
Receive Assignment
→ Open Delivery Details
→ Navigate via Google Maps
→ Update ETA
→ Deliver Meal
→ Upload Proof
→ Mark Delivered
```

---

## Delivery Tracking UI Rules

### Customer Side

Should use:

* timeline UI
* cards
* status chips
* realtime indicators

Avoid:

* maps overload
* technical logistics UI

---

## Delivery Boy Dashboard Rules

Delivery dashboard should prioritize:

* speed
* clarity
* large touch targets
* minimal distractions

---

# 29. Admin Dashboard Design

## Dashboard Philosophy

The admin dashboard is the operational control center of EazyMyTiffin.

The dashboard should feel:

* enterprise-grade
* operationally efficient
* realtime-aware
* data-focused
* clean and organized
* workflow optimized

The admin dashboard should prioritize:

* operational speed
* low friction management
* quick decision making
* realtime visibility
* scalability

---

## Dashboard Design Principles

### Principle 1 — Operational Clarity

Admins should immediately understand:

* active delivery load
* paused subscriptions
* failed payments
* renewal states
* active users

without excessive navigation.

---

### Principle 2 — Table-Optimized Experience

The admin panel should heavily utilize:

* data tables
* filters
* quick actions
* inline editing
* status chips

because operational workflows require speed.

---

### Principle 3 — Desktop First

The dashboard is optimized primarily for:

* desktop screens
* large displays
* operational multitasking

Responsive fallback supported for tablets and mobile.

---

## Sidebar Navigation Structure

### Primary Navigation

* Dashboard
* Tiffin Subscriptions
* Food Orders
* Delivery Management
* Delivery Boys
* Menu Management
* Users
* Notifications
* Analytics
* Settings

---

## Top Navigation Features

Top navbar should contain:

* realtime status indicator
* admin profile
* notification icon
* global search
* quick add button
* logout

---

## Dashboard Homepage Layout

### Top Statistics Cards

Cards include:

* Active Subscribers
* Paused Subscriptions
* Pending Renewals
* Revenue Today
* Pending Deliveries
* Failed Payments

---

### Realtime Activity Feed

Displays:

* latest renewals
* new users
* paused subscriptions
* completed deliveries
* failed payments

---

### Operational Charts

Charts:

* daily revenue graph
* subscription growth graph
* trial conversion graph
* order distribution graph

---

### Delivery Monitoring Section

Displays:

* active delivery boys
* ongoing deliveries
* delayed deliveries
* ETA states

---

## Dashboard UX Rules

### Fast Actions Priority

Admins should perform actions quickly using:

* dropdown menus
* inline actions
* bulk actions
* quick filters

---

### Realtime Behavior

Dashboard should update instantly for:

* new orders
* pause requests
* payment updates
* delivery updates
* new subscriptions

without page refresh.

---

### Search Experience

Global search should support:

* customer name
* phone number
* subscription ID
* order ID
* delivery boy name

---

# 30. Admin Dashboard Priorities

## Operational Priority Order

Priority sequence:

1. Paused subscriptions
2. Subscription renewals
3. Failed payments
4. New users
5. Active deliveries
6. Delivery delays

---

## Dashboard Widgets

### Widget 1 — Active Subscribers

Displays:

* total active subscribers
* growth percentage
* renewal trend

---

### Widget 2 — Revenue Overview

Displays:

* daily revenue
* weekly revenue
* monthly revenue
* subscription revenue split
* food delivery revenue split

---

### Widget 3 — Delivery Operations

Displays:

* active deliveries
* delayed deliveries
* completed deliveries
* unavailable delivery boys

---

### Widget 4 — Trial Analytics

Displays:

* total trials today
* trial conversion percentage
* veg vs non-veg trial distribution

---

### Widget 5 — Subscription Health

Displays:

* paused subscriptions
* expiring plans
* expired plans
* renewal success rates

---

## Dashboard Filtering System

### Global Filters

Supported filters:

* date range
* meal type
* subscription type
* delivery status
* payment status
* area

---

## Realtime Dashboard States

### Live Indicators

Use:

* pulsing realtime indicators
* status chips
* auto-refresh sections

for operational awareness.

---

## Admin Empty States

### No Active Deliveries

Show:

* minimal illustration
* operational summary

---

### No Renewals Pending

Show:

* healthy subscription state
* motivational operational message

---

## Dashboard Accessibility Rules

Admin dashboard should support:

* keyboard navigation
* high readability
* low visual fatigue
* large operational click targets

---

## Recommended Dashboard Layout Grid

```text
┌────────────────────────────┐
│ Top Navigation             │
├────────────┬───────────────┤
│ Sidebar    │ Dashboard     │
│ Navigation │ Widgets       │
│            │ Analytics     │
│            │ Realtime Feed │
│            │ Tables        │
└────────────┴───────────────┘
```

---

## Dashboard Technical Notes

### Rendering Strategy

Recommended:

* server-render initial dashboard
* hydrate realtime sections client-side

using:

* Next.js App Router
* Supabase Realtime
* Zustand state management

---

## Performance Requirements

Dashboard should:

* load quickly on desktop
* support realtime updates efficiently
* minimize unnecessary rerenders
* support scalable operational growth

---

## Security Requirements

Dashboard routes must:

* require admin role
* validate session server-side
* prevent unauthorized access
* log sensitive operations

---

Priority order:

1. Paused subscriptions
2. Subscription renewals
3. Failed payments
4. New users

---

## Dashboard Widgets

* Active Subscribers
* Revenue Overview
* Pending Deliveries
* Failed Payments
* Pause Requests

---

# 31. Admin Operational Capabilities

## Admin Permissions

Admin can:

* create subscriptions
* extend plans
* pause/resume subscriptions
* verify COD payments
* assign delivery boys
* edit menus
* block users
* mark deliveries
* manage analytics

---

## Bulk Operations

### Subscription Bulk Actions

* bulk renew
* bulk pause
* bulk extend

---

### Delivery Bulk Actions

* bulk assign delivery boy
* bulk update delivery status

---

# 32. Analytics System

## Key Metrics

Track:

* active subscribers
* renewal rate
* average order value
* trial conversion rate
* most ordered dishes
* most selected meal category

---

## Revenue Analytics

Admin dashboard should display:

* daily revenue
* weekly revenue
* monthly revenue
* subscription revenue
* food delivery revenue

---

## Operational Analytics

Track:

* paused subscriptions
* failed deliveries
* most active users
* subscription retention
* meal popularity

---

# 33. Realtime Architecture

## Realtime Philosophy

Realtime responsiveness is a top product priority.

The platform should feel:

* live
* synchronized
* operationally active
* instant

---

## Customer Realtime Events

Realtime updates for:

* delivery status
* ETA changes
* subscription pauses
* renewals
* payment confirmations

---

## Admin Realtime Events

Dashboard updates for:

* paused subscriptions
* new orders
* delivery changes
* payment updates

---

## Delivery Boy Realtime Events

Realtime updates for:

* assigned deliveries
* delivery status changes
* cancellation updates

---

# 34. Realtime Channels

## Suggested Customer Channels

```text
user:{id}
subscription:{id}
order:{id}
```

---

## Suggested Admin Channels

```text
admin:dashboard
admin:deliveries
admin:subscriptions
```

---

## Suggested Delivery Channels

```text
delivery:{id}
assignment:{id}
```

---

# 35. Database Architecture

## Core Database Tables

### users

Stores:

* user identity
* role
* verification state
* suspension state

---

### addresses

Stores:

* customer addresses
* map links
* default address state

---

### subscriptions

Stores:

* plan type
* remaining days
* active state
* renewal state

---

### subscription_days

Stores:

* delivery history
* paused dates
* meal tracking

---

### menus

Stores:

* weekly meals
* meal images
* categories

---

### food_orders

Stores:

* instant food orders
* payment state
* delivery state

---

### food_order_items

Stores:

* item-level order details

---

### delivery_assignments

Stores:

* assigned delivery boy
* ETA
* delivery proof
* delivery states

---

### notifications

Stores:

* in-app notification history

---

### payments

Stores:

* payment method
* payment state
* transaction IDs

---

### admin_logs

Stores:

* audit actions
* admin activity history

---

# 36. Suggested API Domains

## Authentication APIs

* login
* verify OTP
* logout
* refresh session

---

## Subscription APIs

* create subscription
* renew subscription
* pause subscription
* resume subscription
* cancel subscription

---

## Food APIs

* list dishes
* create food order
* update order status
* track order

---

## Delivery APIs

* assign delivery
* update ETA
* upload proof
* mark delivered

---

## Admin APIs

* manage users
* manage menus
* analytics
* bulk operations

---

# 37. Zustand State Architecture

## Auth Store

Stores:

* session
* role
* permissions
* verification state

---

## Subscription Store

Stores:

* active subscription
* remaining days
* pause state
* renewal alerts

---

## Order Store

Stores:

* cart state
* order tracking
* delivery states

---

## Notification Store

Stores:

* unread count
* notification history
* realtime notification updates

---

# 38. Error Handling Strategy

## Payment Errors

Display:

* retry payment CTA
* support CTA
* clear explanation

---

## Network Failures

Display:

* reconnecting state
* retry option
* minimal interruption

---

## Delivery Delays

Display:

* updated ETA
* delay message
* owner contact CTA

---

# 39. Empty State UX

## No Active Subscription

Show:

* trial meal CTA
* subscription plans
* benefits section

---

## No Orders

Show:

* recommended dishes
* trending foods
* reorder CTA

---

## No Notifications

Show:

* clean minimal illustration

---

# 40. Mobile Responsiveness Guidelines

## Customer Side

Strictly mobile-first.

Priorities:

* thumb-friendly actions
* large CTA buttons
* smooth scrolling
* fast rendering
* low visual clutter

---

## Admin Side

Desktop-first with responsive fallback.

---

# 41. PWA Strategy

## PWA Goals

* installable application
* app-like experience
* lightweight loading
* fast startup

---

## Install Prompt Strategy

Aggressive install prompts enabled.

---

## PWA Philosophy

The application should behave close to:

* native mobile experience

without requiring app store installation.

---

# 42. SEO Strategy

## SEO Objectives

Target search terms:

* Best Tiffin Service in Bilaspur
* Healthy Tiffin for Students
* Affordable Home Style Meals
* Tiffin for Working Professionals

---

## Technical SEO

Use:

* server-side rendering
* optimized metadata
* semantic structure
* optimized images
* fast page speed

---

# 43. Performance Priorities

Priority order:

1. Realtime smoothness
2. Fast loading
3. SEO optimization
4. Subtle animations

---

## Performance Goals

* low mobile load time
* smooth realtime updates
* optimized rendering
* lightweight bundle sizes

---

# 44. Security Architecture

## Security Priorities

* OTP verification
* duplicate prevention
* protected admin routes
* role-based permissions
* secured payment verification

---

## Abuse Prevention

Prevent:

* multiple trial abuse
* duplicate phone accounts
* unauthorized admin access

---

# 45. Audit Logging System

## Trackable Events

Track:

* admin edits
* subscription modifications
* delivery assignments
* payment changes
* user blocking actions

---

# 46. Future Scalability Direction

## Multi-City Support

Architecture should later support:

* city-level filtering
* city-level delivery operations
* city-specific menus
* city-specific analytics

---

## Multi-Kitchen Support

Future support for:

* kitchen IDs
* kitchen regions
* kitchen allocation

---

## Future Features

Potential future modules:

* referral system
* coupon engine
* smart reorder
* route optimization
* AI recommendations
* corporate subscriptions

---

# 47. Product Risks

## Operational Risks

* inconsistent delivery timing
* food quality inconsistency
* ETA inaccuracy
* renewal drop-offs

---

## Technical Risks

* realtime overload
* auth synchronization issues
* notification delivery failures

---

# 48. MVP Development Priorities

## Phase 1

Core MVP:

* authentication
* subscriptions
* admin dashboard
* realtime updates
* payment flow
* delivery management

---

## Phase 2

Enhancement Phase:

* referral system
* smarter analytics
* reorder system
* operational optimizations

---

## Phase 3

Scale Phase:

* multi-city operations
* vendor onboarding
* multiple kitchens
* advanced logistics

---

# 49. Final UX Philosophy

The platform should never feel:

* overwhelming
* complicated
* enterprise-heavy for customers
* operationally confusing

Instead it should feel:

* warm
* reliable
* lightweight
* smooth
* emotionally comforting
* operationally consistent

---

# 50. Final Product Statement

EazyMyTiffin is a subscription-first home-style meal platform designed to simplify daily food management for students and working professionals through realtime operations, reliable delivery workflows, easy subscription handling, and emotionally comfortable meal experiences.

---

# End of Product Design Document