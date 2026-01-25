Hobby Loop: Master Design Document (MVP)

Version: 1.0.0 Timeline: 30 Days (MVP Strategy: "Concierge & Direct") Tech Stack: Go (Gin) + React (Vite) + PostgreSQL + TailwindCSS
1. Core Philosophy & "The Truths"

These are immutable rules for AI agents working on this project.

    Concierge-First Model: For the MVP, we assume Admins do the heavy lifting. Admins create Baskets for Sellers. Sellers do not need complex "Create Product" wizards yet.

    Link-Based Sales: The primary sales flow is Seller sends Link -> Consumer Clicks -> Consumer Subscribes. We are not building a searchable "Amazon-style" marketplace for the MVP.

    Simplicity Over Abstraction: Do not use Clean Architecture or Hexagonal Architecture if it adds 10 files. Use Controller -> Model or Controller -> Service -> Model.

    Mobile-First Views: Sellers will likely check orders on their phones. Consumers will check deliveries on their phones.

    Data Integrity: Orders must be generated from Subscriptions. The "Delivery Calendar" is simply a view of Orders with future dates.

2. User Journeys (MVP)
A. The Admin (Platform Owner/Employee)

    Onboarding: Admin logs in.

    Seller Setup: Admin creates a User account for a business (Seller).

    Basket Creation: Admin creates a Basket (e.g., "Weekly Veggie Box") and assigns it to that Seller.

    Oversight: Admin views a global list of all Subscriptions and Transactions.

B. The Seller (Business Client)

    Access: Seller logs in to SellerDashboard.

    Distribution: Seller copies a Direct Checkout Link for their Basket to send to clients via WhatsApp/Email.

    Fulfillment: Seller views a simple "Orders to Ship" list.

        Action: Click "Mark as Shipped" -> Status updates.

        Action: Click "Mark as Delivered".

C. The Consumer (End Client)

    Entry: Consumer clicks a shared link (e.g., hobyloop.com/checkout/123).

    Subscription: Consumer registers (name, address, CPF) and confirms payment method (mocked for MVP).

    Tracking: Consumer logs in to ConsumerDashboard.

        View: Delivery Calendar (List of cards: "Next delivery: Friday 24th - Status: Preparing").

3. Data Model (PostgreSQL / GORM)

We stick to the existing model but clarify relationships for the MVP.
Code snippet

erDiagram
    User ||--o{ Basket : "Seller owns"
    User ||--o{ Subscription : "Consumer has"
    Basket ||--o{ Subscription : "Is for"
    Subscription ||--o{ Order : "Generates"

    User {
        uint ID
        string Role "admin|seller|consumer"
        string Email
        string Name
        string CPF_CNPJ
        string Address
    }

    Basket {
        uint ID
        uint SellerID
        string Name
        float Price
        string Frequency "weekly|monthly"
    }

    Subscription {
        uint ID
        uint ConsumerID
        uint BasketID
        string Status "active|cancelled"
        date NextDeliveryDate
    }

    Order {
        uint ID
        uint SubscriptionID
        string Status "pending|preparing|shipped|delivered"
        date ScheduledDate
        string TrackingCode
    }

Critical Logic:

    When a Subscription is created, the backend must immediately generate the first Order.

    A cron job (or simple admin button for MVP) generates future Orders based on the Basket.Frequency.

4. Architecture & Directory Structure

We will standardize the inconsistent structure found in the current repo.
Backend (/)

    cmd/server/main.go: Entry point.

    config/: Env vars and DB connection.

    internal/models/: GORM structs (The source of truth for data).

    internal/controllers/: HTTP handlers (Gin). Logic lives here for MVP.

    internal/routes/: Route definitions.

    internal/middleware/: Auth and CORS.

Frontend (/frontend/src)

    components/ui/: Reusable atoms (Button, Input, Card, Badge). Use Tailwind classes directly.

    components/layout/: Page wrappers, Navbars.

    pages/: One file per route.

        admin/: All admin views.

        seller/: Dashboard and Order views.

        consumer/: Dashboard and Checkout.

        auth/: Login/Register.

    services/: Axios instances and API calls.

    context/: AuthContext (Keep state simple).

5. UI/UX Design Guidelines

    Theme: Dark Mode Default (bg-[#000813]).

    Accents:

        Primary: Neon/Cyber gradients (Purple to Blue).

        Success: Green.

        Warning/Pending: Yellow/Orange.

    Typography: Inter (Sans-serif). Large headings, legible tables.

    Components:

        Cards: Used for Baskets and Orders. High contrast borders.

        Status Badges: Pill-shaped, color-coded (e.g., "Shipped" = Blue bg).

6. Implementation Checklist (The "To-Do" for Agents)
Phase 1: Stabilization (Week 1)

    [ ] Backend: Standardize internal folder. Ensure Subscription creation automatically triggers an Order creation.

    [ ] Frontend: Refactor App.jsx routes to be protected by Role (AdminRoute, SellerRoute, ConsumerRoute).

    [ ] Auth: Ensure localStorage auth is robust enough for MVP (keep user logged in on refresh).

Phase 2: Seller & Admin Features (Week 2)

    [ ] Admin Panel: Create "Add Basket" form (Seller selection, Price, Frequency).

    [ ] Seller Dashboard: Create "Orders List" view. Filter by "Pending" and "Ready to Ship".

    [ ] Actions: Add "Update Status" button to Seller Dashboard orders.

Phase 3: Consumer Experience (Week 3)

    [ ] Checkout Page: Polish the /checkout/:basketId page. It must look trustworthy.

    [ ] Dashboard: Create the "Delivery Timeline" view (vertical list of orders sorted by date).

Phase 4: Polish (Week 4)

    [ ] Seeding: Ensure cmd/seeder creates realistic demo data for the presentation.

    [ ] Deployment: Dockerfile setup.

7. Rules for AI Code Generation

    Do not delete existing working code unless refactoring.

    Always add comments to exported Go functions.

    Frontend: Prefer Functional Components with Hooks.

    Styling: Use Tailwind utility classes. Do not create .css files unless for global animations.

    Error Handling: The Backend must return JSON { "error": "message" }. The Frontend must display these errors in alert() or Toast notifications.

    Validation: Validate CPF/CNPJ on the backend (internal/validators).