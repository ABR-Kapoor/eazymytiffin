# EazyMyTiffin — Realtime Flow Document

# 1. Overview

This document defines the complete realtime architecture and event flow system for EazyMyTiffin.

The realtime system powers:

* delivery tracking
* order status updates
* subscription updates
* admin monitoring
* notifications
* operational synchronization

Implemented using:

* Supabase Realtime
* Zustand state management
* optimistic UI updates

---

# 2. Realtime Philosophy

Realtime is one of the highest product priorities.

The application should feel:

* live
* responsive
* synchronized
* operationally transparent
* trustworthy

---

# 3. Realtime Event Categories

Realtime events grouped into:

* customer events
* admin events
* delivery events
* notification events
* payment events

---

# 4. Customer Realtime Flow

# 4.1 Order Tracking Flow

```text
Admin Updates Order
→ Supabase Realtime Trigger
→ Customer Channel Receives Event
→ Zustand Updates Local State
→ UI Updates Instantly
```

---

# 4.2 Delivery ETA Flow

```text
Delivery Boy Updates ETA
→ Database Updated
→ Realtime Event Triggered
→ Customer Receives ETA Update
→ Tracking Screen Updates
```

---

# 4.3 Subscription Pause Flow

```text
User Pauses Subscription
→ Subscription State Updated
→ Realtime Event Triggered
→ Calendar Updates
→ Admin Dashboard Updates
→ Notification Triggered
```

---

# 4.4 Subscription Renewal Flow

```text
Subscription Renewed
→ Remaining Days Updated
→ Realtime Broadcast Triggered
→ Customer Dashboard Updates
→ Admin Analytics Updates
```

---

# 5. Admin Realtime Flow

# 5.1 New Order Flow

```text
Customer Creates Order
→ Database Insert
→ Admin Dashboard Realtime Event
→ Order Appears Instantly
→ Notification Badge Updates
```

---

# 5.2 Pause Request Flow

```text
Customer Pauses Subscription
→ Realtime Event Triggered
→ Admin Dashboard Updates
→ Pause Count Updated
→ Activity Feed Updated
```

---

# 5.3 Delivery Monitoring Flow

```text
Delivery Boy Updates Status
→ Delivery Assignment Updated
→ Realtime Broadcast
→ Admin Delivery Table Updates
→ Analytics Refreshed
```

---

# 5.4 Payment Verification Flow

```text
Payment Verified
→ Payment Status Updated
→ Realtime Trigger
→ Revenue Dashboard Updates
→ Customer Notification Triggered
```

---

# 6. Delivery Boy Realtime Flow

# 6.1 Assignment Flow

```text
Admin Assigns Delivery
→ Delivery Assignment Created
→ Delivery Boy Channel Receives Event
→ Dashboard Updates Instantly
```

---

# 6.2 Order Cancellation Flow

```text
Order Cancelled
→ Realtime Event Triggered
→ Delivery Dashboard Updates
→ Assignment Removed
```

---

# 6.3 Delivery Completion Flow

```text
Delivery Boy Marks Delivered
→ Order Updated
→ Customer Receives Update
→ Admin Dashboard Updates
→ Analytics Updated
```

---

# 7. Realtime Channels

# 7.1 Customer Channels

## user:{id}

Used for:

* personal notifications
* account updates
* subscription updates

---

## subscription:{id}

Used for:

* pause/resume updates
* renewal updates
* remaining day changes

---

## order:{id}

Used for:

* delivery tracking
* ETA updates
* order state changes

---

# 7.2 Admin Channels

## admin:dashboard

Used for:

* global operational updates
* new orders
* payments
* renewals

---

## admin:subscriptions

Used for:

* subscription state changes
* pause events
* expiry events

---

## admin:deliveries

Used for:

* delivery assignments
* ETA changes
* delivery completion

---

# 7.3 Delivery Channels

## delivery:{id}

Used for:

* assigned deliveries
* delivery updates
* cancellation events

---

## assignment:{id}

Used for:

* ETA updates
* assignment status
* completion updates

---

# 8. Realtime Event Types

# 8.1 Customer Events

| Event                 | Purpose                    |
| --------------------- | -------------------------- |
| order_updated         | Order state changes        |
| eta_updated           | ETA changes                |
| subscription_updated  | Subscription state updates |
| notification_received | New notifications          |
| payment_updated       | Payment verification       |

---

# 8.2 Admin Events

| Event               | Purpose                |
| ------------------- | ---------------------- |
| new_order           | New food order         |
| new_subscription    | New subscription       |
| delivery_updated    | Delivery state changes |
| payment_verified    | Revenue updates        |
| paused_subscription | Pause operations       |

---

# 8.3 Delivery Events

| Event              | Purpose          |
| ------------------ | ---------------- |
| assignment_created | New assignment   |
| order_cancelled    | Remove delivery  |
| eta_change         | ETA updates      |
| delivery_completed | Delivery closure |

---

# 9. Zustand Realtime Strategy

# 9.1 Incremental State Updates

Realtime events should:

* patch existing state
* avoid full reloads
* update only changed entities

---

# 9.2 Optimistic UI

Use optimistic updates for:

* pause subscription
* ETA updates
* delivery state changes

---

# 9.3 Event Debouncing

Debounce:

* analytics updates
* rapid delivery events
* notification bursts

---

# 10. Realtime Performance Strategy

# 10.1 Subscription Optimization

Avoid:

* subscribing to unnecessary tables
* broad realtime channels
* large payloads

---

# 10.2 Payload Optimization

Realtime payloads should:

* remain minimal
* avoid nested objects
* contain only required data

---

# 10.3 Render Optimization

Realtime updates should:

* minimize rerenders
* isolate component updates
* update table rows individually

---

# 11. Realtime Security Rules

# 11.1 Customer Security

Customers can only subscribe to:

* their own user channel
* their own order channel
* their own subscription channel

---

# 11.2 Delivery Boy Security

Delivery boys can only subscribe to:

* assigned deliveries
* their delivery channel

---

# 11.3 Admin Security

Admin channels require:

* admin role validation
* protected session
* realtime authorization

---

# 12. Realtime Notification Flow

# 12.1 Notification Pipeline

```text
Database Event
→ Notification Service
→ Create Notification Record
→ Trigger Realtime Event
→ UI Notification Appears
```

---

# 12.2 Notification Channels

Realtime notifications support:

* in-app updates
* badge updates
* notification drawers
* toast messages

---

# 13. Realtime Error Handling

# 13.1 Connection Loss

If realtime disconnects:

* reconnect automatically
* show connection state
* retry silently

---

# 13.2 Failed Events

If event sync fails:

* fetch latest state
* rehydrate Zustand store
* restore UI consistency

---

# 14. Future Realtime Scalability

Future support:

* multi-city realtime segmentation
* kitchen-specific channels
* delivery routing updates
* advanced operational dashboards

---

# 15. Engineering Recommendations

Recommended practices:

* use channel cleanup properly
* unsubscribe on component unmount
* isolate heavy subscriptions
* lazy load analytics channels

---

# 16. Final Realtime Philosophy

The realtime system should make EazyMyTiffin feel:

* alive
* operationally reliable
* transparent
* premium
* fast
* synchronized

while maintaining:

* scalability
* low latency
* rendering efficiency
* developer maintainability

---

# End of Realtime Flow Document
