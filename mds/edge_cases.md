# EazyMyTiffin — Edge Cases & Operational Scenarios

# 1. Overview

This document defines important edge cases, operational risks, failure scenarios, and validation situations for EazyMyTiffin.

The purpose is to:

* prevent unexpected failures
* improve operational reliability
* reduce user confusion
* improve scalability
* support production readiness

---

# 2. Authentication Edge Cases

# 2.1 Google Login Success But User Sync Failure

## Scenario

Google authentication succeeds but Supabase user creation fails.

---

## Expected Behavior

System should:

* rollback session creation
* retry sync
* show retry UI
* prevent partial onboarding

---

# 2.2 OTP Verification Timeout

## Scenario

User enters OTP after expiration.

---

## Expected Behavior

* reject OTP
* show resend option
* limit resend attempts

---

# 2.3 Duplicate Phone Number

## Scenario

User tries to register using an already verified phone.

---

## Expected Behavior

* reject registration
* show duplicate warning
* suggest login

---

# 2.4 Blocked User Session

## Scenario

Admin blocks user while user session is active.

---

## Expected Behavior

* invalidate protected routes
* redirect to blocked screen
* disable operations instantly

---

# 3. Subscription Edge Cases

# 3.1 User Tries Multiple Active Subscriptions

## Scenario

User attempts to buy another subscription while already active.

---

## Expected Behavior

* prevent purchase
* show active subscription warning

---

# 3.2 Pause After Cutoff Time

## Scenario

User tries to pause after:

* 11 AM for lunch
* 6 PM for dinner

---

## Expected Behavior

* current meal remains active
* pause applies from next meal
* show explanatory message

---

# 3.3 Resume During Active Delivery

## Scenario

User resumes while delivery already processing.

---

## Expected Behavior

* apply from next valid meal cycle
* avoid duplicate deliveries

---

# 3.4 Remaining Days Become Negative

## Scenario

Incorrect deduction logic reduces remaining days below zero.

---

## Expected Behavior

* block negative state
* auto-disable subscription
* log anomaly

---

# 3.5 Expired Subscription With Pending Delivery

## Scenario

Subscription expires while meal already prepared.

---

## Expected Behavior

* complete active delivery
* expire after delivery completion

---

# 4. Trial Meal Edge Cases

# 4.1 User Tries Multiple Trial Claims

## Scenario

User creates multiple accounts for trial abuse.

---

## Expected Behavior

Validate using:

* phone number
* Google account
* admin review

Reject duplicate trials.

---

# 4.2 Trial Payment Success But Subscription Creation Fails

## Scenario

Payment successful but DB insert fails.

---

## Expected Behavior

* retry subscription creation
* notify admin
* prevent duplicate payment attempts

---

# 5. Address Edge Cases

# 5.1 User Adds More Than 3 Addresses

## Expected Behavior

* reject creation
* require deleting existing address first

---

# 5.2 Invalid Google Maps Link

## Expected Behavior

* validate URL format
* reject invalid links

---

# 5.3 Address Change Before Delivery Cutoff

## Scenario

User changes address too late.

---

## Expected Behavior

Prevent changes:

* after 11 AM lunch cutoff
* after 6 PM dinner cutoff

---

# 5.4 Unsupported City

## Scenario

User selects non-Bilaspur city.

---

## Expected Behavior

* show Coming Soon state
* disable ordering

---

# 6. Food Order Edge Cases

# 6.1 Payment Success But Order Not Created

## Expected Behavior

* retry order creation
* verify transaction
* prevent duplicate charge
* notify admin

---

# 6.2 Duplicate Payment Webhook

## Scenario

PhonePe sends webhook multiple times.

---

## Expected Behavior

* use idempotency checks
* ignore duplicate processing

---

# 6.3 Order Cancellation After Preparation

## Expected Behavior

* reject cancellation
* show preparation started message

---

# 6.4 User Refreshes During Payment

## Expected Behavior

* preserve payment session
* verify transaction status
* restore checkout state

---

# 7. Delivery Edge Cases

# 7.1 Delivery Boy Becomes Unavailable Mid Delivery

## Expected Behavior

* allow admin reassignment
* notify customer
* update ETA

---

# 7.2 Delivery Boy Marks Delivered Accidentally

## Expected Behavior

* allow admin correction
* log delivery change

---

# 7.3 Customer Not Reachable

## Expected Behavior

Delivery boy can:

* mark unavailable
* upload proof
* notify admin

---

# 7.4 Delivery ETA Never Updated

## Expected Behavior

* fallback ETA displayed
* admin alerted for delay

---

# 7.5 Delivery Proof Upload Failure

## Expected Behavior

* retry upload
* allow temporary completion state
* notify admin if repeated failure

---

# 8. Realtime Edge Cases

# 8.1 Realtime Connection Loss

## Expected Behavior

* reconnect automatically
* restore latest state
* show reconnect indicator

---

# 8.2 Duplicate Realtime Events

## Expected Behavior

* ignore duplicate payloads
* use event IDs where possible

---

# 8.3 Outdated Realtime State

## Expected Behavior

* fetch latest server state
* rehydrate Zustand store

---

# 9. Notification Edge Cases

# 9.1 WhatsApp Delivery Failure

## Expected Behavior

* retry notification
* fallback to in-app notification

---

# 9.2 Email Delivery Failure

## Expected Behavior

* retry email
* log failed notification

---

# 9.3 Notification Spam

## Expected Behavior

* debounce notifications
* merge repetitive alerts

---

# 10. Admin Edge Cases

# 10.1 Admin Accidentally Converts User Role

## Expected Behavior

* require confirmation dialog
* log action
* allow reversal

---

# 10.2 Admin Deletes Active Menu Item

## Expected Behavior

* preserve historical orders
* hide item only for new orders

---

# 10.3 Bulk Action Failure Midway

## Expected Behavior

* partial rollback support
* operation logs
* failed item reporting

---

# 11. Database Edge Cases

# 11.1 Concurrent Subscription Updates

## Expected Behavior

* use transactions
* prevent race conditions

---

# 11.2 Duplicate Inserts

## Expected Behavior

* enforce unique constraints
* reject duplicates safely

---

# 11.3 Orphaned Records

## Expected Behavior

* use cascading deletes carefully
* maintain audit history

---

# 12. Payment Edge Cases

# 12.1 COD Not Verified

## Expected Behavior

* remain pending
* block renewal abuse
* notify admin

---

# 12.2 Payment Verified Twice

## Expected Behavior

* prevent duplicate revenue entry
* use transaction validation

---

# 13. Performance Edge Cases

# 13.1 Large Dashboard Dataset

## Expected Behavior

* pagination
* virtualization
* lazy loading

---

# 13.2 Heavy Realtime Traffic

## Expected Behavior

* debounce updates
* optimize subscriptions
* reduce payload size

---

# 14. PWA Edge Cases

# 14.1 Offline State

## Expected Behavior

* show offline banner
* preserve local state
* reconnect automatically

---

# 14.2 Old Cached Version

## Expected Behavior

* notify user about update
* refresh service worker safely

---

# 15. Future Scalability Edge Cases

Future considerations:

* multi-city data conflicts
* kitchen routing failures
* vendor ownership validation
* city-specific realtime isolation

---

# 16. Logging Requirements

Log:

* payment failures
* realtime disconnects
* subscription anomalies
* role changes
* failed notifications
* delivery anomalies

---

# 17. Final Edge Case Philosophy

The platform should prioritize:

* graceful failure handling
* operational consistency
* user trust
* data integrity
* recovery mechanisms
* realtime stability

The system should fail safely instead of unpredictably.

---

# End of Edge Cases Document
