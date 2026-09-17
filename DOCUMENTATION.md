# Lumina Posters — Platform Documentation & Technical Manual

Welcome to the official technical documentation for **Lumina Posters**, a modern full-stack e-commerce web platform designed for printing, framing, and distributing fine art posters.

---

## 1. Executive Summary & Overview

**Lumina Posters** combines modern web technologies to deliver a museum-grade poster gallery shopping experience with real-time inventory management, responsive frame visualizers, custom password & phone OTP admin authentication, customer portal management, and AI-powered support capabilities.

### Key Capabilities
- **Museum-Grade Curation**: Catalog showcasing architectural, botanical, abstract, and Japanese woodblock prints with high-res zoom imagery.
- **Custom Framing Visualizer**: Real-time canvas rendering of frame materials (Natural Oak, Anodized Black Aluminum, Gallery White, Walnut, Vintage Gold) with proportional border calculations.
- **Real-Time Database Synchronization**: Instant updates across storefront and administrative views for stock changes, order status updates, and catalog modifications.
- **Full Order Lifecycle Management**: End-to-end processing from checkout to printing, framing, shipping, tracking numbers, and restock-enabled cancellations.
- **Admin Control Panel**: Comprehensive metrics overview, inventory stock control, category creation, coupon generator, customer reviews moderation, and system settings.
- **AI Customer Assistant**: Embedded AI chat support answering print dimension, shipping policy, framing, and custom sizing questions in real-time.

---

## 2. Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                               CLIENT                                   │
│  React 18  │  TypeScript  │  Tailwind CSS  │  Framer Motion  │  Lucide   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  REST APIs (JSON)
┌───────────────────────────────────▼────────────────────────────────────┐
│                             BACKEND SERVER                             │
│       Express (Node.js)  │  Vite Development Middleware / Esbuild       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  In-Memory & Persistent Storage
┌───────────────────────────────────▼────────────────────────────────────┐
│                             DATA ENGINE                                │
│       Local Storage  │  Express State Persistence  │  Server APIs       │
└────────────────────────────────────────────────────────────────────────┘
```

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (Mobile-first, warm neutral palette, dark mode support)
- **Animations**: Framer Motion (`motion/react`) with spring physics and sliding modal transitions
- **Icons**: Lucide React
- **Portals**: React DOM Portals for modals, drawers, and global toasts

### Backend Stack
- **Server**: Express.js running on Node.js
- **Development Engine**: `tsx` with Vite middleware
- **Production Build Engine**: Esbuild bundling `server.ts` into CommonJS (`dist/server.cjs`)
- **Port & Ingress**: Port 3000, binding to `0.0.0.0`

---

## 3. Database Schema & Data Models

All primary data models are defined in `/src/types.ts`.

### 3.1 Product (`Product`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique product identifier (e.g. `prod-1`) |
| `name` | `string` | Artwork title |
| `description` | `string` | Full art description and historical context |
| `images` | `string[]` | Array of high-resolution print image URLs |
| `category` | `string` | Category classification |
| `price` | `number` | Base price for standard print size |
| `discountPrice` | `number \| null` | Sale price if discounted |
| `sizes` | `PosterSize[]` | Available dimensions and price multipliers |
| `frameOptions` | `FrameOption[]` | Compatible custom frame choices |
| `stock` | `number` | Live stock count |
| `sku` | `string` | Stock Keeping Unit code |
| `tags` | `string[]` | Search and filter tags |
| `rating` | `number` | Average customer review rating (1 to 5) |
| `reviewCount` | `number` | Total verified customer reviews |

### 3.2 Order (`Order`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Order ID |
| `orderNumber` | `string` | Human-readable order reference (e.g. `LUM-84920`) |
| `customer` | `object` | Full name, email, phone |
| `shippingAddress` | `ShippingAddress` | Destination street, city, state, postal code, country |
| `items` | `OrderItem[]` | Purchased items with print size, frame choice, unit price |
| `subtotal` | `number` | Total price before discounts and shipping |
| `discount` | `number` | Applied promo discount amount |
| `couponCode` | `string?` | Applied coupon code |
| `shipping` | `number` | Calculated shipping fee |
| `tax` | `number` | Tax calculation |
| `total` | `number` | Final charged amount |
| `status` | `OrderStatus` | `Pending` \| `Processing` \| `Printed & Framed` \| `Shipped` \| `Delivered` \| `Cancelled` |
| `timeline` | `Array` | Sequential history of order status changes with timestamps |

### 3.3 User Account (`UserAccount`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Customer account identifier |
| `name` | `string` | Customer full name |
| `email` | `string` | Primary login email |
| `role` | `'customer' \| 'admin'` | Access level permissions |
| `phone` | `string?` | Contact phone number |
| `addresses` | `ShippingAddress[]` | Saved delivery locations |
| `wishlist` | `string[]` | Product IDs saved to wishlist |

---

## 4. REST API Endpoint Reference

The backend exposes endpoints under `/api/*` for client-server communication.

### 4.1 System & Health
- `GET /api/health`
  - **Returns**: `{ status: "ok", timestamp: ISOString, uptime: number, memory: object }`
  - **Use**: Health check monitoring and system telemetry.

### 4.2 Products & Catalog
- `GET /api/products`
  - **Returns**: Array of active products with sizes, frames, and stock status.
- `POST /api/products`
  - **Body**: `Partial<Product>`
  - **Description**: Add a new poster print to the inventory.
- `PUT /api/products/:id`
  - **Body**: `Partial<Product>`
  - **Description**: Update pricing, stock, description, or dimensions.
- `DELETE /api/products/:id`
  - **Description**: Remove artwork from active store listings.

### 4.3 Orders & Fulfillment
- `GET /api/orders`
  - **Returns**: Complete order history for store management.
- `POST /api/orders`
  - **Body**: `{ customer, items, shippingAddress, paymentMethod, couponCode }`
  - **Returns**: Newly created `Order` object with generated tracking number and estimated delivery.
- `PATCH /api/orders/:id/status`
  - **Body**: `{ status: OrderStatus, trackingNumber?: string, note?: string }`
  - **Description**: Advance order status or cancel with restock options.

### 4.4 Admin & Store Operations
- `POST /api/admin/auth`
  - **Body**: `{ password: string }` or `{ phone: string, otpCode: string }`
  - **Returns**: `{ success: boolean, token?: string }`
- `GET /api/coupons`
  - **Returns**: List of active promotional discount codes.
- `POST /api/coupons`
  - **Body**: `Coupon` object (`code`, `discountType`, `discountValue`, `minSpend`).

### 4.5 AI Support Assistant
- `POST /api/chat`
  - **Body**: `{ message: string, conversationHistory?: Array<{ role, text }> }`
  - **Returns**: `{ reply: string }`
  - **Description**: Proxies requests to Gemini server-side using `process.env.GEMINI_API_KEY`.

---

## 5. UI Components & Feature Guide

| Component File | Role & Specifications |
| :--- | :--- |
| `/src/App.tsx` | Main application shell, view routing, global toast provider, and admin state management. |
| `/src/components/Header.tsx` | Top navigation bar with live search, wishlist counter, cart trigger, theme switcher, and sliding mobile menu. |
| `/src/components/Hero.tsx` | Storefront header section showcasing featured artwork, museum paper credentials, and primary CTA. |
| `/src/components/ShopPage.tsx` | Catalog view with category filters, sorting options (price, popularity, rating), and instant search. |
| `/src/components/ProductDetailPage.tsx` | Interactive custom framing previewer, dimension selector, frame style picker, and stock check. |
| `/src/components/CartDrawer.tsx` | Slide-over cart drawer with free shipping progress bar, quantity controls, and coupon redemption. |
| `/src/components/CheckoutModal.tsx` | Multi-step checkout with address selection, payment option picker (Card, Apple Pay, PayPal, UPI), and summary. |
| `/src/components/AccountModal.tsx` | Customer portal for order history, delivery tracking, address management, and wishlist items. |
| `/src/components/AdminDashboard.tsx` | Control panel with store metrics, order fulfillment modal, inventory restock, and bulk pricing. |
| `/src/components/AdminAuthModal.tsx` | Secure multi-step admin sign-in with password verification and simulated SMS OTP recovery. |
| `/src/components/AIChatBubble.tsx` | Floating customer support widget providing real-time AI guidance on sizes, frames, and orders. |
| `/src/components/DeveloperModal.tsx` | Interactive modal displaying developer profile, architecture details, and live API telemetry. |

---

## 6. Environment & Configuration

All environment variables must be declared in `.env.example`:

```env
# Node & Server Environment
NODE_ENV=development
PORT=3000

# Server-Only Secrets (Never exposed to browser)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Build & Execution Scripts
- `npm run dev`: Boots server using `tsx server.ts` with Vite middleware mode on port 3000.
- `npm run build`: Compiles client bundle via Vite and bundles backend server to `dist/server.cjs` via Esbuild.
- `npm run start`: Launches production server via `node dist/server.cjs`.
- `npm run lint`: Runs TypeScript compiler (`tsc --noEmit`) to verify syntax and types.

---

## 7. Developer Contact & Support

- **Lead Developer & System Architect**: System Engineering Team
- **Contact Email**: `ktechwith@gmail.com`
- **License**: Apache-2.0

---
*Lumina Posters © 2026. All rights reserved.*
