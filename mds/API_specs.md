# EazyMyTiffin — API Specification Document

# 1. Overview

This document defines the API architecture and endpoint specifications for EazyMyTiffin.

The APIs are designed for:

* realtime meal operations
* subscription management
* food delivery workflows
* admin operations
* delivery tracking
* mobile-first performance

---

# 2. API Architecture

## API Strategy

The application uses:

* Next.js Route Handlers
* Server Actions
* Supabase SDK
* Edge Functions where necessary

---

## API Design Principles

The APIs should be:

* REST-oriented
* modular
* scalable
* secure
* realtime-compatible
* mobile optimized

---

# 3. Base API Structure

```text
/api
  /auth
  /users
  /addresses
  /subscriptions
  /orders
  /delivery
  /menus
  /payments
  /notifications
  /admin
```

---

# 4. Authentication APIs

# 4.1 Verify User Session

## Endpoint

```text
GET /api/auth/session
```

---

## Purpose

Returns:

* authenticated user
* role
* verification state
* blocked state

---

## Response

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "role": "customer",
    "verified": true
  }
}
```

---

# 4.2 Sync Authenticated User

## Endpoint

```text
POST /api/auth/sync-user
```

---

## Purpose

Sync Clerk authenticated user into Supabase users table.

---

## Request Body

```json
{
  "clerk_user_id": "string",
  "email": "string",
  "full_name": "string",
  "phone": "string"
}
```

---

# 4.3 Verify Phone OTP

## Endpoint

```text
POST /api/auth/verify-phone
```

---

## Request Body

```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

---

## Response

```json
{
  "success": true,
  "verified": true
}
```

---

# 5. User APIs

# 5.1 Get User Profile

## Endpoint

```text
GET /api/users/profile
```

---

## Response

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "customer"
}
```

---

# 5.2 Update User Profile

## Endpoint

```text
PATCH /api/users/profile
```

---

## Request Body

```json
{
  "full_name": "John Doe",
  "profile_image": "url"
}
```

---

# 5.3 Block User (Admin)

## Endpoint

```text
PATCH /api/users/block/:id
```

---

## Permissions

Admin only.

---

# 6. Address APIs

# 6.1 Get User Addresses

## Endpoint

```text
GET /api/addresses
```

---

# 6.2 Create Address

## Endpoint

```text
POST /api/addresses
```

---

## Request Body

```json
{
  "type": "hostel",
  "house_flat_no": "A-302",
  "landmark": "Near Mall",
  "area": "Rajkishore Nagar",
  "city": "Bilaspur",
  "google_map_link": "https://maps.google.com/..."
}
```

---

# 6.3 Update Address

## Endpoint

```text
PATCH /api/addresses/:id
```

---

# 6.4 Delete Address

## Endpoint

```text
DELETE /api/addresses/:id
```

---

# 7. Subscription APIs

# 7.1 Get Active Subscription

## Endpoint

```text
GET /api/subscriptions/active
```

---

# 7.2 Create Subscription

## Endpoint

```text
POST /api/subscriptions/create
```

---

## Request Body

```json
{
  "plan_id": "uuid",
  "category": "veg",
  "meal_type": "both",
  "payment_method": "phonepe"
}
```

---

## Validation Rules

Validate:

* existing active subscription
* trial eligibility
* payment state

---

# 7.3 Pause Subscription

## Endpoint

```text
POST /api/subscriptions/pause
```

---

## Request Body

```json
{
  "subscription_id": "uuid"
}
```

---

## Logic

Must:

* validate cutoff timing
* skip meal deduction
* extend expiry
* trigger notifications

---

# 7.4 Resume Subscription

## Endpoint

```text
POST /api/subscriptions/resume
```

---

# 7.5 Renew Subscription

## Endpoint

```text
POST /api/subscriptions/renew
```

---

# 7.6 Cancel Subscription

## Endpoint

```text
POST /api/subscriptions/cancel
```

---

# 8. Food Delivery APIs

# 8.1 Get Menu

## Endpoint

```text
GET /api/menus
```

---

## Query Parameters

```text
?category=veg
?meal_type=lunch
```

---

# 8.2 Create Food Order

## Endpoint

```text
POST /api/orders/create
```

---

## Request Body

```json
{
  "address_id": "uuid",
  "payment_method": "phonepe",
  "items": [
    {
      "menu_id": "uuid",
      "quantity": 2
    }
  ],
  "notes": "Less spicy"
}
```

---

## Server Responsibilities

Server must:

* validate stock state
* calculate totals
* create payment entry
* initialize order lifecycle

---

# 8.3 Get User Orders

## Endpoint

```text
GET /api/orders
```

---

# 8.4 Get Order Details

## Endpoint

```text
GET /api/orders/:id
```

---

# 8.5 Cancel Order

## Endpoint

```text
POST /api/orders/cancel
```

---

## Validation

Allow cancellation only:

* before preparation starts

---

# 9. Delivery APIs

# 9.1 Assign Delivery Boy

## Endpoint

```text
POST /api/delivery/assign
```

---

## Permissions

Admin only.

---

## Request Body

```json
{
  "order_id": "uuid",
  "delivery_boy_id": "uuid"
}
```

---

# 9.2 Update ETA

## Endpoint

```text
PATCH /api/delivery/eta
```

---

## Request Body

```json
{
  "assignment_id": "uuid",
  "eta": "10 mins"
}
```

---

# 9.3 Mark Delivered

## Endpoint

```text
POST /api/delivery/delivered
```

---

## Request Body

```json
{
  "assignment_id": "uuid",
  "proof_image": "url"
}
```

---

## Server Actions

Server must:

* update delivery state
* update order state
* trigger notifications

---

# 9.4 Delivery Dashboard Orders

## Endpoint

```text
GET /api/delivery/orders
```

---

# 10. Payment APIs

# 10.1 Initialize PhonePe Payment

## Endpoint

```text
POST /api/payments/phonepe/initiate
```

---

## Request Body

```json
{
  "amount": 199,
  "type": "subscription"
}
```

---

# 10.2 Verify Payment

## Endpoint

```text
POST /api/payments/verify
```

---

## Server Responsibilities

Server must:

* verify PhonePe signature
* verify transaction state
* update payment status
* trigger notifications

---

# 10.3 COD Verification

## Endpoint

```text
POST /api/payments/cod/verify
```

---

## Permissions

Admin only.

---

# 11. Notification APIs

# 11.1 Get Notifications

## Endpoint

```text
GET /api/notifications
```

---

# 11.2 Mark Notification Read

## Endpoint

```text
PATCH /api/notifications/read/:id
```

---

# 11.3 Send Notification (Internal)

## Endpoint

```text
POST /api/notifications/send
```

---

## Supported Channels

* in-app
* email
* WhatsApp

---

# 12. Admin APIs

# 12.1 Dashboard Analytics

## Endpoint

```text
GET /api/admin/dashboard
```

---

## Response Includes

* active subscribers
* revenue overview
* pending renewals
* paused subscriptions
* delivery metrics

---

# 12.2 Get All Subscriptions

## Endpoint

```text
GET /api/admin/subscriptions
```

---

## Query Filters

```text
?status=active
?meal_type=both
?category=veg
```

---

# 12.3 Bulk Renew Subscriptions

## Endpoint

```text
POST /api/admin/subscriptions/bulk-renew
```

---

# 12.4 Bulk Assign Delivery

## Endpoint

```text
POST /api/admin/delivery/bulk-assign
```

---

# 12.5 Menu Management APIs

## Create Menu Item

```text
POST /api/admin/menu/create
```

---

## Update Menu Item

```text
PATCH /api/admin/menu/:id
```

---

## Delete Menu Item

```text
DELETE /api/admin/menu/:id
```

---

# 13. Realtime Event Specifications

# 13.1 Customer Events

## order_updated

Payload:

```json
{
  "order_id": "uuid",
  "status": "out_for_delivery"
}
```

---

## eta_updated

```json
{
  "assignment_id": "uuid",
  "eta": "10 mins"
}
```

---

## subscription_updated

```json
{
  "subscription_id": "uuid",
  "status": "paused"
}
```

---

# 13.2 Admin Events

## new_order

```json
{
  "order_id": "uuid",
  "amount": 299
}
```

---

## new_subscription

```json
{
  "subscription_id": "uuid"
}
```

---

# 14. Error Response Structure

## Standard Error Response

```json
{
  "success": false,
  "message": "Invalid request",
  "code": "INVALID_REQUEST"
}
```

---

# 15. Success Response Structure

## Standard Success Response

```json
{
  "success": true,
  "message": "Operation successful"
}
```

---

# 16. Security Architecture

# 16.1 API Protection

Protected APIs must:

* validate Clerk session
* validate role
* validate blocked state
* validate ownership

---

# 16.2 Admin Protection

Admin APIs require:

* admin role
* server-side validation
* audit logging

---

# 16.3 Rate Limiting

Apply rate limits on:

* OTP verification
* payment verification
* login requests
* notification sending

---

# 17. Validation Rules

# 17.1 Address Validation

Validate:

* max 3 addresses
* Bilaspur only
* valid Google Maps URL

---

# 17.2 Trial Validation

Prevent:

* multiple trial claims
* duplicate phone accounts
* duplicate user abuse

---

# 17.3 Subscription Validation

Prevent:

* multiple active subscriptions
* invalid meal states
* expired renewals

---

# 18. Background Jobs & Cron Tasks

# 18.1 Renewal Reminder Cron

Runs daily.

Purpose:

* send 7-day reminders
* send 3-day reminders

---

# 18.2 Expiry Cron

Purpose:

* expire inactive subscriptions
* disable overdue accounts

---

# 18.3 Notification Retry Cron

Purpose:

* retry failed notifications
* retry email delivery
* retry WhatsApp delivery

---

# 19. Performance Guidelines

APIs should:

* minimize payload size
* support pagination
* avoid overfetching
* support realtime syncing

---

# 20. Final API Philosophy

The EazyMyTiffin API system is designed for:

* operational simplicity
* realtime responsiveness
* scalable meal operations
* mobile-first performance
* future SaaS scalability

---

# End of API Specification Document
