# Hobby Loop - Gap Analysis Report

**Date:** 2026-01-24  
**Version:** 1.0  
**Scope:** MVP Codebase vs. Ideation.md Design Document

---

## Executive Summary

This report analyzes the current Hobby Loop codebase against the requirements specified in [`Ideation.md`](Ideation.md). The platform is a subscription-based marketplace with three user roles (Admin, Seller, Consumer) following a concierge-first model.

**Overall Status:** 🟡 **Partially Implemented** (~65% complete)

### Critical Findings:
1. ✅ **Core data models exist** but missing critical fields
2. ⚠️ **Subscription → Order generation logic is MISSING** (Critical MVP requirement)
3. ✅ **Basic CRUD endpoints implemented** but missing Admin basket creation
4. ⚠️ **Frontend pages exist** but lack role-based route protection
5. ⚠️ **Authentication is rudimentary** (header-based, no JWT/sessions)

---

## 1. Data Model Status

### 1.1 User Model
**File:** [`models/models.go:8-30`](models/models.go:8-30)

| Field | Required by Design | Current Status | Notes |
|-------|-------------------|----------------|-------|
| `ID` | ✅ | ✅ Present | Via `gorm.Model` |
| `Role` | ✅ (admin/seller/consumer) | ✅ Present | Indexed |
| `Email` | ✅ | ✅ Present | Unique, indexed |
| `Name` | ✅ | ✅ Present | |
| `CPF_CNPJ` | ✅ | ⚠️ **Split into CPF/CNPJ** | Design shows single field, implementation has two |
| `Address` | ✅ | ⚠️ **Decomposed** | Split into Street/Number/City/State/Zip (better design) |
| `Password` | ❌ Not in design | ✅ Present | Good addition for security |
| `IsActive` | ❌ Not in design | ✅ Present | Admin-specific field |
| `Permissions` | ❌ Not in design | ✅ Present | Admin-specific field (JSON string) |

**Gap:** Design document shows simplified address as single field, but implementation correctly decomposes it. This is an **improvement** over the design.

---

### 1.2 Basket Model
**File:** [`models/models.go:32-39`](models/models.go:32-39)

| Field | Required by Design | Current Status | Notes |
|-------|-------------------|----------------|-------|
| `ID` | ✅ | ✅ Present | Via `gorm.Model` |
| `SellerID` | ✅ | ✅ Present | Mapped as `UserID` |
| `Name` | ✅ | ✅ Present | |
| `Price` | ✅ | ✅ Present | |
| `Frequency` | ✅ (weekly/monthly) | ❌ **MISSING** | **CRITICAL GAP** |
| `Description` | ❌ Not in design | ✅ Present | Good addition |

**Critical Gap:** The `Frequency` field is **missing from the Basket model**. According to the design (line 76), baskets should have a frequency property. Currently, frequency is only stored in the Subscription model, which is acceptable but differs from the design.

**Design Decision:** The current implementation where frequency is on Subscription (not Basket) is actually more flexible - it allows the same basket to be subscribed to at different frequencies by different consumers.

---

### 1.3 Subscription Model
**File:** [`models/models.go:42-50`](models/models.go:42-50)

| Field | Required by Design | Current Status | Notes |
|-------|-------------------|----------------|-------|
| `ID` | ✅ | ✅ Present | Via `gorm.Model` |
| `ConsumerID` | ✅ | ✅ Present | Mapped as `UserID` |
| `BasketID` | ✅ | ✅ Present | |
| `Status` | ✅ (active/cancelled) | ✅ Present | |
| `NextDeliveryDate` | ✅ | ❌ **MISSING** | **CRITICAL GAP** |
| `Frequency` | ✅ | ✅ Present | Validation: weekly/biweekly/monthly |

**Critical Gap:** The `NextDeliveryDate` field is **completely missing**. This is essential for:
- Determining when to generate the next order
- Displaying delivery calendar to consumers
- Cron job scheduling

---

### 1.4 Order Model
**File:** [`models/models.go:53-61`](models/models.go:53-61)

| Field | Required by Design | Current Status | Notes |
|-------|-------------------|----------------|-------|
| `ID` | ✅ | ✅ Present | Via `gorm.Model` |
| `SubscriptionID` | ✅ | ✅ Present | Indexed |
| `Status` | ✅ (pending/preparing/shipped/delivered) | ✅ Present | Default: 'preparing' |
| `ScheduledDate` | ✅ | ❌ **MISSING** | **CRITICAL GAP** |
| `TrackingCode` | ✅ | ✅ Present | |
| `ShippedAt` | ❌ Not in design | ✅ Present | Good addition |
| `DeliveredAt` | ❌ Not in design | ✅ Present | Good addition |

**Critical Gap:** The `ScheduledDate` field is **missing**. This is required for:
- Delivery calendar view
- Sorting orders by scheduled delivery date
- Distinguishing between order creation date and delivery date

---

## 2. Backend API Status

### 2.1 Authentication & User Management
**Files:** [`internal/controllers/user_controller.go`](internal/controllers/user_controller.go), [`internal/routes/routes.go`](internal/routes/routes.go)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/login` | POST | ✅ Implemented | Email-only login (no password check!) |
| `/register` | POST | ✅ Implemented | Supports seller/consumer roles |
| `/users/:id` | PUT | ✅ Implemented | Update user profile |

**Security Gap:** Login endpoint ([`user_controller.go:12-29`](internal/controllers/user_controller.go:12-29)) only checks email existence, **no password validation**. This is acceptable for MVP demo but not production-ready.

---

### 2.2 Admin Endpoints
**Files:** [`internal/controllers/admin_controller.go`](internal/controllers/admin_controller.go), [`internal/routes/routes.go:58-64`](internal/routes/routes.go:58-64)

| Endpoint | Method | Status | Required By Design | Notes |
|----------|--------|--------|-------------------|-------|
| `/admin/users` | GET | ✅ Implemented | ✅ Yes | View all users |
| `/admin/subscriptions` | GET | ✅ Implemented | ✅ Yes | View all subscriptions |
| `/admin/baskets` | GET | ✅ Implemented | ✅ Yes | View all baskets |
| `/admin/baskets` | POST | ❌ **MISSING** | ✅ **YES** | **Create basket for seller** |
| `/admin/sellers` | POST | ❌ **MISSING** | ✅ **YES** | **Create seller account** |

**Critical Gap:** According to the design (lines 22-25), **Admins create baskets for Sellers** in the concierge-first model. The endpoint to create baskets exists (`POST /baskets`) but it's **not restricted to admins** and doesn't have an admin-specific route.

**Current Implementation:** The `POST /baskets` endpoint ([`basket_controller.go:18-40`](internal/controllers/basket_controller.go:18-40)) is publicly accessible and requires `seller_id` in the request body. This works but doesn't enforce the concierge model.

---

### 2.3 Basket Endpoints
**File:** [`internal/controllers/basket_controller.go`](internal/controllers/basket_controller.go)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/baskets` | POST | ✅ Implemented | Should be admin-only per design |
| `/baskets/:id` | GET | ✅ Implemented | Public access for checkout |
| `/sellers/:id/baskets` | GET | ✅ Implemented | List seller's baskets |

**Status:** Functional but missing admin-only restriction on basket creation.

---

### 2.4 Subscription Endpoints
**File:** [`internal/controllers/subscription_controller.go`](internal/controllers/subscription_controller.go)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/subscriptions` | POST | ✅ Implemented | Creates subscription |
| `/sellers/:id/subscriptions` | GET | ✅ Implemented | Seller's customer list |
| `/consumers/:id/subscriptions` | GET | ✅ Implemented | Consumer's subscriptions |

**Critical Logic Gap:** The `CreateSubscription` function ([`subscription_controller.go:18-39`](internal/controllers/subscription_controller.go:18-39)) **does NOT automatically generate the first Order** as required by the design (line 97):

> "When a Subscription is created, the backend must immediately generate the first Order."

**Current Behavior:** Subscription is created with status "Active" but no order is generated.

---

### 2.5 Order Endpoints
**File:** [`internal/controllers/order_controller.go`](internal/controllers/order_controller.go)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/orders` | POST | ✅ Implemented | Manual order creation |
| `/orders/:id` | GET | ✅ Implemented | Get single order |
| `/orders/:id/status` | PUT | ✅ Implemented | Update order status |
| `/subscriptions/:id/orders` | GET | ✅ Implemented | Orders for subscription |
| `/baskets/:id/orders` | GET | ✅ Implemented | Orders for basket (seller view) |

**Status:** All CRUD operations exist, but missing automatic order generation logic.

---

## 3. Frontend Status

### 3.1 Routing & Protection
**File:** [`frontend/src/App.jsx`](frontend/src/App.jsx)

| Route | Component | Status | Protection |
|-------|-----------|--------|------------|
| `/` | Landing | ✅ Implemented | Public |
| `/login` | Login | ✅ Implemented | Public |
| `/seller` | SellerDashboard | ✅ Implemented | ⚠️ Client-side only |
| `/seller/orders/:basketId` | SellerOrderManagement | ✅ Implemented | ⚠️ Client-side only |
| `/consumer` | ConsumerDashboard | ✅ Implemented | ⚠️ Client-side only |
| `/admin` | AdminDashboard | ✅ Implemented | ⚠️ Client-side only |
| `/checkout/:id` | ConsumerCheckout | ✅ Implemented | Public (correct) |
| `/seller-registration` | SellerRegistration | ✅ Implemented | Public |
| `/subscriber-registration` | SubscriberRegistration | ✅ Implemented | Public |
| `/config` | ConfigPage | ✅ Implemented | Public |

**Gap:** The design (line 163) requires role-based route protection:
> "Refactor App.jsx routes to be protected by Role (AdminRoute, SellerRoute, ConsumerRoute)"

**Current Implementation:** Each page component has a `useEffect` check that redirects unauthorized users ([`AdminDashboard.jsx:21-26`](frontend/src/pages/AdminDashboard.jsx:21-26)), but this is **client-side only** and not enforced at the route level.

---

### 3.2 Admin Dashboard
**File:** [`frontend/src/pages/AdminDashboard.jsx`](frontend/src/pages/AdminDashboard.jsx)

| Feature | Required | Status | Notes |
|---------|----------|--------|-------|
| View all users | ✅ | ✅ Implemented | Table view with role badges |
| View all subscriptions | ✅ | ✅ Implemented | Card view with details |
| View all baskets | ✅ | ✅ Implemented | Card view with pricing |
| Create seller account | ✅ | ❌ **MISSING** | **Critical for concierge model** |
| Create basket for seller | ✅ | ❌ **MISSING** | **Critical for concierge model** |
| Tab navigation | ❌ | ✅ Implemented | Good UX addition |
| Stats dashboard | ❌ | ✅ Implemented | Shows counts by role |

**Critical Gap:** The admin dashboard is **read-only**. According to the design (lines 22-25), admins should be able to:
1. Create seller accounts
2. Create baskets and assign them to sellers

**Current Workaround:** Admins would need to use the public registration form or manually insert data.

---

### 3.3 Seller Dashboard
**File:** [`frontend/src/pages/SellerDashboard.jsx`](frontend/src/pages/SellerDashboard.jsx)

| Feature | Required | Status | Notes |
|---------|----------|--------|-------|
| View subscriptions (clients) | ✅ | ✅ Implemented | Shows consumer name, basket, frequency |
| View baskets (products) | ✅ | ✅ Implemented | Shows name, price |
| Copy checkout link | ✅ | ✅ Implemented | Clipboard API integration |
| View orders to ship | ✅ | ✅ Implemented | Via separate page |

**Status:** ✅ Fully functional per design requirements.

---

### 3.4 Seller Order Management
**File:** [`frontend/src/pages/SellerOrderManagement.jsx`](frontend/src/pages/SellerOrderManagement.jsx)

| Feature | Required | Status | Notes |
|---------|----------|--------|-------|
| View orders for basket | ✅ | ✅ Implemented | Shows customer details |
| Filter by status | ✅ | ✅ Implemented | All/Preparing/Shipped/Delivered |
| Mark as shipped | ✅ | ✅ Implemented | Updates status + timestamp |
| Mark as delivered | ✅ | ✅ Implemented | Updates status + timestamp |
| View customer address | ✅ | ✅ Implemented | Shows full delivery address |

**Status:** ✅ Fully functional and well-designed. Exceeds design requirements with filtering.

---

### 3.5 Consumer Dashboard
**File:** [`frontend/src/pages/ConsumerDashboard.jsx`](frontend/src/pages/ConsumerDashboard.jsx)

| Feature | Required | Status | Notes |
|---------|----------|--------|-------|
| View subscriptions | ✅ | ✅ Implemented | Shows basket name, price, frequency |
| Delivery calendar | ✅ | ⚠️ **Partial** | Shows latest order status only |
| View order status | ✅ | ✅ Implemented | Icons + text for status |
| View tracking code | ✅ | ✅ Implemented | Displayed when available |
| View scheduled delivery date | ✅ | ❌ **MISSING** | No ScheduledDate field in Order model |

**Gap:** The design (line 49) requires:
> "Delivery Calendar (List of cards: 'Next delivery: Friday 24th - Status: Preparing')"

**Current Implementation:** Shows the most recent order's status but **cannot show scheduled delivery dates** because the `ScheduledDate` field doesn't exist in the Order model.

---

### 3.6 Consumer Checkout
**File:** [`frontend/src/pages/ConsumerCheckout.jsx`](frontend/src/pages/ConsumerCheckout.jsx)

| Feature | Required | Status | Notes |
|---------|----------|--------|-------|
| View basket details | ✅ | ✅ Implemented | Name, price, description |
| Enter address | ✅ | ⚠️ **UI only** | Fields present but not submitted |
| Enter payment info | ✅ | ⚠️ **Mocked** | Fields present, not processed |
| Create subscription | ✅ | ✅ Implemented | Hardcoded to "monthly" |
| Frequency selection | ✅ | ⚠️ **UI only** | Dropdown shown but not functional |

**Gaps:**
1. Frequency is hardcoded to "monthly" ([`ConsumerCheckout.jsx:37`](frontend/src/pages/ConsumerCheckout.jsx:37))
2. Address and payment fields are not captured or submitted
3. User must be logged in (good) but no guest checkout option

**Note:** Payment mocking is acceptable for MVP per design document.

---

### 3.7 Registration Pages
**Files:** [`frontend/src/pages/SellerRegistration.jsx`](frontend/src/pages/SellerRegistration.jsx), [`frontend/src/pages/SubscriberRegistration.jsx`](frontend/src/pages/SubscriberRegistration.jsx)

| Feature | Status | Notes |
|---------|--------|-------|
| Seller registration form | ✅ Implemented | Name, company, CNPJ, email, address |
| Consumer registration form | ✅ Implemented | Name, email, CPF, address |
| CPF/CNPJ validation | ⚠️ Backend only | Frontend doesn't validate before submit |
| Error handling | ✅ Implemented | Shows error messages |

**Gap:** According to the concierge model (line 22), **Admins create seller accounts**, not sellers themselves. The seller registration form contradicts this design principle.

---

## 4. Authentication & Authorization Status

### 4.1 Authentication Mechanism
**File:** [`internal/middleware/auth.go`](internal/middleware/auth.go)

**Current Implementation:**
- Header-based authentication using `X-User-ID` header
- No JWT, no sessions, no password validation
- User ID is looked up in database on each request

**Security Issues:**
1. ❌ No password verification in login
2. ❌ Anyone can impersonate any user by setting `X-User-ID` header
3. ❌ No token expiration
4. ❌ No refresh mechanism

**MVP Acceptability:** The design (line 165) acknowledges this:
> "Ensure localStorage auth is robust enough for MVP (keep user logged in on refresh)"

**Status:** ⚠️ Acceptable for MVP demo, **NOT production-ready**.

---

### 4.2 Role-Based Access Control
**File:** [`internal/middleware/auth.go:44-63`](internal/middleware/auth.go:44-63)

| Feature | Status | Notes |
|---------|--------|-------|
| `RequireAdmin()` middleware | ✅ Implemented | Checks user.role === "admin" |
| `RequireSeller()` middleware | ❌ Missing | Not implemented |
| `RequireConsumer()` middleware | ❌ Missing | Not implemented |
| Admin routes protected | ✅ Yes | `/admin/*` routes use middleware |
| Other routes protected | ❌ No | Public access to all other endpoints |

**Gap:** Only admin routes are protected. Seller and consumer endpoints are publicly accessible.

---

## 5. Critical Logic Status

### 5.1 Subscription → Order Generation
**Design Requirement (lines 95-99):**
> "When a Subscription is created, the backend must immediately generate the first Order. A cron job (or simple admin button for MVP) generates future Orders based on the Basket.Frequency."

**Current Status:** ❌ **COMPLETELY MISSING**

**Impact:** This is the **most critical gap** in the entire codebase. Without this logic:
- Consumers subscribe but receive no orders
- Sellers have no orders to fulfill
- The entire delivery workflow is broken

**Required Implementation:**
1. Modify `CreateSubscription` controller to generate first order
2. Add cron job or admin endpoint to generate future orders
3. Calculate `NextDeliveryDate` based on frequency

---

### 5.2 Order Status Workflow
**File:** [`internal/controllers/order_controller.go:109-149`](internal/controllers/order_controller.go:109-149)

**Current Implementation:**
- ✅ Status transitions: preparing → shipped → delivered
- ✅ Timestamps recorded (ShippedAt, DeliveredAt)
- ✅ Tracking code support
- ✅ Notification system (mocked via console log)

**Status:** ✅ Fully functional

---

### 5.3 Delivery Calendar Logic
**Design Requirement (line 49):**
> "Delivery Calendar (List of cards: 'Next delivery: Friday 24th - Status: Preparing')"

**Current Status:** ❌ **Cannot be implemented** without:
1. `ScheduledDate` field in Order model
2. `NextDeliveryDate` field in Subscription model
3. Automatic order generation logic

---

## 6. Database Seeding Status

### 6.1 Seeder Implementation
**File:** [`cmd/seeder/main.go`](cmd/seeder/main.go)

**Current Capabilities:**
- ✅ Seeds Users (admin, sellers, consumers)
- ✅ Seeds Baskets
- ✅ Seeds Subscriptions
- ❌ Does NOT seed Orders

**Gap:** The seeder creates subscriptions but no orders, so demo data is incomplete for testing the seller order management workflow.

---

## 7. Gap Summary (Prioritized)

### 🔴 Critical (Blocks MVP)

1. **Subscription → Order Generation Logic**
   - **Impact:** Core business logic missing
   - **Files:** [`internal/controllers/subscription_controller.go`](internal/controllers/subscription_controller.go)
   - **Effort:** Medium (2-4 hours)
   - **Action:** Add order creation in `CreateSubscription` function

2. **Missing Database Fields**
   - `Subscription.NextDeliveryDate` (date)
   - `Order.ScheduledDate` (date)
   - **Impact:** Cannot implement delivery calendar
   - **Files:** [`models/models.go`](models/models.go)
   - **Effort:** Low (1 hour + migration)
   - **Action:** Add fields and update migrations

3. **Admin Basket Creation UI**
   - **Impact:** Concierge model cannot function
   - **Files:** [`frontend/src/pages/AdminDashboard.jsx`](frontend/src/pages/AdminDashboard.jsx)
   - **Effort:** Medium (3-4 hours)
   - **Action:** Add form to create baskets and assign to sellers

---

### 🟡 Important (Degrades UX)

4. **Delivery Calendar View**
   - **Impact:** Consumers cannot see upcoming deliveries
   - **Files:** [`frontend/src/pages/ConsumerDashboard.jsx`](frontend/src/pages/ConsumerDashboard.jsx)
   - **Effort:** Low (1-2 hours) - depends on #2
   - **Action:** Display orders sorted by ScheduledDate

5. **Checkout Frequency Selection**
   - **Impact:** All subscriptions hardcoded to "monthly"
   - **Files:** [`frontend/src/pages/ConsumerCheckout.jsx`](frontend/src/pages/ConsumerCheckout.jsx)
   - **Effort:** Low (1 hour)
   - **Action:** Make frequency dropdown functional

6. **Role-Based Route Protection**
   - **Impact:** Security and UX issue
   - **Files:** [`frontend/src/App.jsx`](frontend/src/App.jsx)
   - **Effort:** Medium (2-3 hours)
   - **Action:** Create ProtectedRoute components

---

### 🟢 Nice to Have (Polish)

7. **Seller/Consumer Middleware**
   - **Impact:** Backend security
   - **Files:** [`internal/middleware/auth.go`](internal/middleware/auth.go)
   - **Effort:** Low (1 hour)
   - **Action:** Add `RequireSeller()` and `RequireConsumer()` functions

8. **Order Seeding**
   - **Impact:** Demo data completeness
   - **Files:** [`cmd/seeder/main.go`](cmd/seeder/main.go)
   - **Effort:** Low (1 hour)
   - **Action:** Generate sample orders for subscriptions

9. **Checkout Address Capture**
   - **Impact:** Address not saved during checkout
   - **Files:** [`frontend/src/pages/ConsumerCheckout.jsx`](frontend/src/pages/ConsumerCheckout.jsx)
   - **Effort:** Low (1-2 hours)
   - **Action:** Submit address fields with subscription

---

## 8. Recommendations

### Immediate Actions (Week 1)
1. ✅ **Add missing database fields** (Subscription.NextDeliveryDate, Order.ScheduledDate)
2. ✅ **Implement automatic order generation** when subscription is created
3. ✅ **Build admin basket creation form** to enable concierge model
4. ✅ **Update seeder** to generate sample orders

### Short-term (Week 2)
5. ✅ **Implement delivery calendar** in consumer dashboard
6. ✅ **Add frequency selection** to checkout flow
7. ✅ **Create role-based route guards** in frontend

### Medium-term (Week 3-4)
8. ✅ **Implement cron job** for recurring order generation
9. ✅ **Add proper authentication** (JWT or sessions)
10. ✅ **Protect backend endpoints** with role-based middleware

---

## 9. Positive Findings

Despite the gaps, the codebase has several strengths:

1. ✅ **Clean architecture** - Simple controller → model pattern (no over-engineering)
2. ✅ **Good separation** - Backend and frontend properly separated
3. ✅ **Comprehensive seller workflow** - Order management page is excellent
4. ✅ **Mobile-first design** - UI components are responsive
5. ✅ **Internationalization** - i18n system in place
6. ✅ **Validation** - CPF/CNPJ validators implemented
7. ✅ **Good UX** - Status badges, filtering, and visual feedback
8. ✅ **Preloading** - Proper eager loading of relationships in queries

---

## 10. Conclusion

The Hobby Loop codebase is **65% complete** toward the MVP vision outlined in [`Ideation.md`](Ideation.md). The foundation is solid, with good architecture and most CRUD operations in place.

**The single most critical missing piece is the subscription-to-order generation logic**, which is the core business logic of the platform. Without this, the platform cannot function as designed.

**Estimated effort to reach MVP-ready state:** 15-20 hours of focused development, primarily on:
- Database schema updates (2 hours)
- Order generation logic (4 hours)
- Admin basket creation UI (4 hours)
- Delivery calendar implementation (3 hours)
- Route protection and polish (4 hours)
- Testing and bug fixes (3 hours)

The codebase demonstrates good engineering practices and is well-positioned for rapid completion of the MVP.

---

**Report Generated:** 2026-01-24  
**Analyzed Files:** 20+ files across backend and frontend  
**Lines of Code Reviewed:** ~2,500 lines
