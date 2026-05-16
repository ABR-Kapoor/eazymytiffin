# EazyMyTiffin — RBAC (Role Based Access Control)

# 1. Overview

This document defines:

* user roles
* permissions
* access rules
* protected actions
* dashboard access
* API authorization

The RBAC system ensures:

* operational security
* role isolation
* protected admin workflows
* secure delivery operations

---

# 2. User Roles

Supported roles:

* customer
* delivery_boy
* admin

---

# 3. Customer Role

## Customer Permissions

Customers can:

* view menus
* purchase subscriptions
* order food
* manage addresses
* pause subscriptions
* resume subscriptions
* track deliveries
* view notifications
* contact support
* manage profile

---

## Customer Restrictions

Customers cannot:

* access admin dashboard
* manage other users
* modify menus
* assign deliveries
* access analytics
* verify payments

---

## Customer Accessible Routes

```text
/home
/tiffin
/food-delivery
/orders
/profile
```

---

# 4. Delivery Boy Role

## Delivery Boy Permissions

Delivery boys can:

* view assigned deliveries
* update ETA
* mark delivery completed
* upload proof image
* contact customers
* update delivery status

---

## Delivery Boy Restrictions

Delivery boys cannot:

* access customer dashboard
* access admin dashboard
* modify menus
* access analytics
* verify payments
* manage subscriptions

---

## Delivery Boy Accessible Routes

```text
/delivery/deliveries
```

---

# 5. Admin Role

## Admin Permissions

Admins can:

* manage subscriptions
* manage food orders
* assign delivery boys
* manage menus
* manage users
* verify COD payments
* manage analytics
* configure settings
* block users
* manage realtime operations

---

## Admin Accessible Routes

```text
/admin/dashboard
/admin/subscriptions
/admin/orders
/admin/users
/admin/analytics
/admin/settings
```

---

# 6. Permission Matrix

| Action                | Customer | Delivery Boy | Admin |
| --------------------- | -------- | ------------ | ----- |
| View Menu             | Yes      | No           | Yes   |
| Place Order           | Yes      | No           | Yes   |
| Pause Subscription    | Yes      | No           | Yes   |
| Resume Subscription   | Yes      | No           | Yes   |
| Track Delivery        | Yes      | Yes          | Yes   |
| Update ETA            | No       | Yes          | Yes   |
| Upload Delivery Proof | No       | Yes          | Yes   |
| Assign Delivery       | No       | No           | Yes   |
| Manage Users          | No       | No           | Yes   |
| Verify Payments       | No       | No           | Yes   |
| View Analytics        | No       | No           | Yes   |
| Modify Menu           | No       | No           | Yes   |
| Block User            | No       | No           | Yes   |

---

# 7. Route Protection Rules

# 7.1 Customer Routes

Require:

* authenticated user
* verified phone
* active account
* customer role

---

# 7.2 Delivery Routes

Require:

* authenticated user
* verified phone
* delivery_boy role
* active account

---

# 7.3 Admin Routes

Require:

* authenticated user
* verified phone
* admin role
* active account

---

# 8. Blocked User Rules

Blocked users:

* cannot access internal application routes
* can only view landing pages
* see account blocked message

---

# 9. Role Conversion Rules

# 9.1 Customer → Delivery Boy

When converted:

* customer dashboard hidden
* delivery dashboard enabled
* role updated instantly
* realtime session refresh required

---

# 9.2 Delivery Boy → Customer

When role removed:

* delivery dashboard disabled
* customer dashboard enabled

---

# 10. Middleware Authorization

Middleware validates:

* session validity
* role access
* blocked status
* phone verification

---

# 11. API Authorization Rules

# 11.1 Customer APIs

Customers can only access:

* their own data
* their own subscriptions
* their own orders
* their own addresses

---

# 11.2 Delivery APIs

Delivery boys can only access:

* assigned deliveries
* assigned customers
* delivery workflow APIs

---

# 11.3 Admin APIs

Admin APIs require:

* server-side role validation
* protected middleware
* audit logging

---

# 12. Database Security Rules

# 12.1 Row Level Security

Use RLS policies for:

* users
* addresses
* subscriptions
* orders
* notifications

---

# 12.2 Ownership Validation

Validate ownership for:

* orders
* subscriptions
* addresses
* notifications

---

# 13. Audit Logging Rules

Log:

* user blocking
* role changes
* payment verification
* subscription changes
* menu modifications
* delivery assignments

---

# 14. Realtime Authorization

Realtime channels must:

* validate role access
* validate ownership
* prevent unauthorized subscriptions

---

# 15. Future Scalability Rules

Future RBAC system should support:

* city managers
* kitchen managers
* support executives
* operational supervisors

without changing core architecture.

---

# 16. Security Priorities

Priority order:

1. Admin protection
2. Payment protection
3. Trial abuse prevention
4. User ownership validation
5. Realtime authorization

---

# 17. Final RBAC Philosophy

The RBAC system is designed to:

* minimize operational risk
* isolate permissions cleanly
* support realtime systems securely
* simplify operational management
* scale with future SaaS expansion

---

# End of RBAC Document
