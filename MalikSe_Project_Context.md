# MalikSe — Complete Project Context Document
**Version:** 1.0 | **Date:** September 2026 | **Built for:** Devoxa Technologies
**Base Codebase:** Adapted from the Landroid app (React Native / Expo) — GIS, drone, and agri-analytics features removed
**Author:** Devoxa Technologies

> **Note to IT team:** This document repurposes the existing app skeleton (Expo Router structure, Zustand stores, service-layer pattern, document-vault pattern, dashboard/list pattern) for the MalikSe "Verified Owner-to-Buyer Property Marketplace." All GIS/drone/agri-specific modules from the previous build are **removed**. Authentication moves from Firebase to **JWT**, and the database is **MongoDB** end-to-end (no Firestore).

---

## Table of Contents
1. Product Vision & Problem Statement
2. What's Removed vs. What's Reused
3. User Roles
4. Functional Requirements (FR)
5. Non-Functional Requirements (NFR)
6. Technical Requirements
7. Architecture Overview
8. Screen & Module Reference (mapped from old → new)
9. API Contract Reference
10. Data Models
11. External Integrations
12. Deployment & Setup
13. MVP Scope & Build Phases

---

## 1. Product Vision & Problem Statement

### Problem
Property buying/selling in India is plagued by fake listings, unverifiable ownership, and middlemen who obscure direct owner-buyer communication. Buyers cannot easily tell whether a listed owner is the real, legally registered owner, and there is no structured way to verify documents and site conditions before a deal is made public.

### Solution — MalikSe
MalikSe is a mobile + web marketplace where **only verified registered owners** can list property, a **company advisor** performs document and physical site verification, and **verified listings** are then published for buyers to discover and contact the owner directly — with the company earning a transparent 1% + tax commission from each side on a successful deal.

| Pillar | What it Delivers |
|---|---|
| Owner Verification Pipeline | Multi-stage badge system (Identity → Documents → Site Visit → Lawyer Review → Fully Verified) before a listing goes public |
| Property Listing & Search | Structured listing form (survey/khata/khesra fields) with map location, photos/videos, and buyer-side search/filter/compare |
| Controlled Owner–Buyer Contact | OTP/KYC-gated "Contact Owner" flow; number hidden until owner consents |
| Deal & Commission Tracking | Offer/counter-offer flow, token payment, auto-generated receipts, deal status tracking, 1% + tax commission |
| Advisor Mobile Panel | GPS check-in, checklist-driven site verification, photo/video upload, digital sign-off |
| Document Vault | Secure, watermarked, access-controlled storage for registry, mutation, LPC/jamabandi, map, and other ownership documents |

---

## 2. What's Removed vs. What's Reused

### ❌ Removed entirely (GIS/agri-specific, not relevant to MalikSe)
- GIS Map Viewer with Orthomosaic/DEM/NDVI toggle layers
- Drone GeoTIFF upload & parsing (`georaster`, `georaster-layer-for-leaflet`)
- Land Health Dashboard (composite health score, environmental signals)
- Tree & Canopy Analytics (OpenCV watershed segmentation, `mlModel/main.py`)
- Land Valuation AI engine (`valuationEngine.ts`, `/valuate-parcel`)
- Python FastAPI + Rasterio + OpenCV ML backend and its tile server (`/tiles/*`)
- Microsoft Planetary Computer, ISRIC SoilGrids, OSM Overpass integrations
- Firebase Auth & Firestore
- Tamil-specific agri UI strings (language framework itself is reused, see below)

### ✅ Reused / adapted patterns
| Landroid Pattern | MalikSe Adaptation |
|---|---|
| `authStore.ts` (Zustand) | Same pattern, but backed by **JWT** issued from a Node/Express backend instead of Firebase |
| `languageStore.ts` + `translations.ts` (i18n) | Reused as-is for Hindi/English toggle |
| `parcelService.ts` CRUD pattern | Becomes `propertyService.ts` — same shape (load/save/get-by-user), backed by MongoDB via REST API instead of AsyncStorage/Firestore |
| Document Vault (`VaultDocument`, `uploadParcelDocument`, `generateShareLink`) | Becomes **Property Document Vault** — same upload/list/share-link pattern, now for registry/mutation/LPC/map documents, stored in MongoDB (GridFS or S3-compatible storage) instead of local object URLs |
| Dashboard list + card pattern (`dashboard.tsx`, `renderParcelCard`) | Becomes **Property Listing Dashboard** (owner's "My Properties" and buyer's "Search Results") |
| Users/Invite screen (`users.tsx`, `inviteLandowner`) | Becomes **Advisor Assignment / Buyer Verification** screen for Admin |
| Bottom Nav | Reused, tabs updated to: Home/Search, My Properties (or Saved, for buyers), Messages, Profile |
| Mini-map preview component | Reused as a **single-pin property location preview** (no drone overlay) — just shows the property marker on a satellite/street basemap |
| Map screen (`index.web.tsx`) | Drastically simplified: becomes a **property search map** showing pins for listed properties with filter controls, no layer toggles, no boundary drawing, no measurement tools |

---

## 3. User Roles

| Role | Description | Key Capabilities |
|---|---|---|
| **Seller / Registered Owner** | Individual/joint owner listing a property | Register with KYC, list property, upload documents, respond to offers, manage joint-owner consent |
| **Buyer** | Person searching for property | Search/filter/compare, save favorites, book site visits, send offers, contact owner (post-KYC) |
| **Company Advisor / Verification Agent** | Field staff performing verification | View assigned tasks, GPS check-in, upload site photos, complete checklist, submit report |
| **Admin** | Platform operator | Approve/reject listings, assign advisors, manage disputes, view reports, manage complaints |
| **(Future) Lawyer** | Legal document reviewer | Review documents for "Lawyer Reviewed" badge |
| **(Future) Surveyor** | Physical land surveyor | Assist in boundary/area verification |
| **(Future) Bank Representative** | Loan/mortgage verification | Assist in loan/dispute verification |

---

## 4. Functional Requirements (FR)

### 4.1 Authentication & Onboarding
| FR ID | Requirement | Notes |
|---|---|---|
| FR-01 | Mobile OTP login | Via SMS OTP provider (e.g., MSG91/Twilio), not Firebase |
| FR-02 | JWT-based session management | Access token + refresh token issued by Node/Express backend |
| FR-03 | Role-based onboarding (Owner / Buyer / Advisor / Admin) | Role stored on User model, drives which app screens/tabs render |
| FR-04 | Email verification | Verification link/OTP sent via backend mail service |
| FR-05 | Bearer token API protection | All protected routes require `Authorization: Bearer <JWT>`; middleware validates + refreshes |

### 4.2 Owner Registration & KYC
| FR ID | Requirement |
|---|---|
| FR-06 | Owner submits name, address, profile photo |
| FR-07 | Owner uploads PAN/KYC documents |
| FR-08 | System supports adding multiple joint owners per property, each requiring consent |
| FR-09 | System validates owner name against registry document name (manual/advisor-assisted match in MVP) |
| FR-10 | Owner digitally accepts consent letter & T&Cs before listing |
| FR-11 | Any Aadhaar data collection is gated behind a legal/compliance review flag before going live |

### 4.3 Property Listing
| FR ID | Requirement |
|---|---|
| FR-12 | Owner creates listing: property type (land/flat/house/shop/office), state, district, block/circle, mauza, police-station no. |
| FR-13 | Owner enters khata, khesra/plot, holding numbers |
| FR-14 | Owner specifies total area, sellable area, boundary (chauhaddi), road width |
| FR-15 | Owner specifies price and negotiability flag |
| FR-16 | Owner sets property location via map pin (lat/lng) |
| FR-17 | Owner uploads photos, videos (drone video upload retained only as an optional media type — no processing/analysis) |
| FR-18 | Owner uploads ownership documents: registry, mutation, rent receipt, LPC/jamabandi, map |
| FR-19 | Owner discloses existing loan, dispute, or possession issues |
| FR-20 | New listings default to a non-public "Pending Verification" status |

### 4.4 Verification Workflow
| FR ID | Requirement |
|---|---|
| FR-21 | Listing pipeline: Initial Document Check → Advisor Site Visit → (Correction Required / Rejected / Verified) → Published |
| FR-22 | Verification badges tracked independently: Identity Verified, Ownership Documents Checked, Site Visited, Lawyer Reviewed, Fully Verified |
| FR-23 | Admin gives final approval before a listing is published |
| FR-24 | Platform displays a legal disclaimer clarifying "Verified" ≠ full legal title guarantee |

### 4.5 Buyer Features
| FR ID | Requirement |
|---|---|
| FR-25 | Search by location, budget, area, property type |
| FR-26 | View listings on a simple pin map (no GIS layers) |
| FR-27 | Filter for Verified-only listings |
| FR-28 | Save favorites; compare 2+ listings side by side |
| FR-29 | Book a site visit; request video call/meeting with owner |
| FR-30 | Send offer; ask questions on a listing |
| FR-31 | Post a buyer requirement (reverse listing) |
| FR-32 | Get alerts for new matching listings |
| FR-33 | Report a suspicious listing |

### 4.6 Owner–Buyer Communication
| FR ID | Requirement |
|---|---|
| FR-34 | Owner's number hidden by default |
| FR-35 | Buyer clicks "Contact Owner" → OTP/KYC check → owner consent → number/chat unlocked |
| FR-36 | In-app chat and call logging |
| FR-37 | Advisor can be added to a buyer-owner conversation |
| FR-38 | Basic spam/fake-inquiry detection (rate limiting, flagged keywords) |

### 4.7 Commission & Deal Management
| FR ID | Requirement |
|---|---|
| FR-39 | Digital consent capture from both parties before deal processing |
| FR-40 | Commission (1% + applicable tax) displayed upfront to both parties |
| FR-41 | Offer / Accept / Reject / Counter-Offer flow |
| FR-42 | Online token payment (payment gateway integration, e.g., Razorpay/Cashfree) |
| FR-43 | Auto-generated payment receipt and commission invoice |
| FR-44 | End-to-end deal status tracking; mark "Sold" on completion |
| FR-45 | Downloadable Agreement/Deal Confirmation |
| FR-46 | Cancellation & refund rule enforcement |

### 4.8 Advisor Mobile Panel
| FR ID | Requirement |
|---|---|
| FR-47 | View assigned verification tasks; call owner from panel |
| FR-48 | Map navigation to site (basic "open in maps" link, no custom GIS) |
| FR-49 | GPS check-in at site |
| FR-50 | Upload live site photos/videos |
| FR-51 | Document verification checklist + inspection report |
| FR-52 | Digital signature on report |
| FR-53 | Flag incorrect info / request owner correction |
| FR-54 | Submit daily visit report |

### 4.9 Admin Dashboard
| FR ID | Requirement |
|---|---|
| FR-55 | View totals: owners, buyers, properties |
| FR-56 | Pending / Verified / Rejected listing queues |
| FR-57 | Advisor workload distribution |
| FR-58 | Buyer inquiries, site visits, offers overview |
| FR-59 | Ongoing/completed deals, commissions, payments |
| FR-60 | Complaint/dispute management; block suspicious accounts |
| FR-61 | Reports by city/budget/property type, exportable as CSV/Excel |
| FR-62 | Full audit log of platform activity |

### 4.10 Notifications & Localization
| FR ID | Requirement |
|---|---|
| FR-63 | SMS, email, WhatsApp notifications |
| FR-64 | WhatsApp Business API integration |
| FR-65 | Hindi/English language toggle (reused `languageStore` + `translations.ts`) |

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance
| NFR | Requirement |
|---|---|
| NFR-P1 | Listing search results load within 2–3 seconds |
| NFR-P2 | Map pin view renders within 2 seconds for up to ~500 visible listings (clustering beyond that) |
| NFR-P3 | Document upload provides progress feedback; large files (video) chunked/streamed |
| NFR-P4 | Dashboard list loads within 3 seconds using pagination |

### 5.2 Security
| NFR | Requirement |
|---|---|
| NFR-S1 | JWT access tokens short-lived (e.g., 15 min) with refresh-token rotation |
| NFR-S2 | Passwords/OTP secrets hashed (bcrypt) and never logged |
| NFR-S3 | All API traffic over HTTPS/TLS |
| NFR-S4 | Documents encrypted at rest in MongoDB/object storage; watermarked before buyer-facing display |
| NFR-S5 | Buyers cannot download full unwatermarked registry documents |
| NFR-S6 | Role-based access control (RBAC) enforced at API middleware level |
| NFR-S7 | Admin accounts require 2FA |
| NFR-S8 | Full audit trail of document access and listing status changes |

### 5.3 Scalability
| NFR | Requirement |
|---|---|
| NFR-SC1 | Backend (Node/Express) stateless and horizontally scalable behind a load balancer |
| NFR-SC2 | MongoDB sharding/indexing strategy planned for listings at scale (index on location, price, status) |
| NFR-SC3 | Media (photos/videos/documents) stored in object storage (e.g., S3-compatible), not in MongoDB documents directly |

### 5.4 Usability
| NFR | Requirement |
|---|---|
| NFR-U1 | Hindi + English bilingual UI (reused i18n system) |
| NFR-U2 | Simple, uncluttered property search/filter UI (no GIS-layer complexity) |
| NFR-U3 | Mini-map preview shows a single property pin on listing cards |
| NFR-U4 | Bottom navigation accessible from all screens |

### 5.5 Compatibility
| NFR | Requirement |
|---|---|
| NFR-C1 | Web (React Native Web) as primary platform |
| NFR-C2 | Android app from the same Expo codebase |
| NFR-C3 | Platform-gated components retained where needed (e.g., map rendering differences) |

### 5.6 Reliability
| NFR | Requirement |
|---|---|
| NFR-R1 | Graceful error banners for failed uploads/API calls |
| NFR-R2 | Listing creation retries/queues on network failure (offline-friendly draft save) |
| NFR-R3 | Backend health checks + automated restart on crash |

---

## 6. Technical Requirements

### 6.1 Frontend Stack (reused from Landroid, GIS libraries dropped)
| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo | ~54.0.34 | Build system, native APIs |
| Expo Router | ~6.0.23 | File-based routing |
| TypeScript | ~5.9.2 | Type safety |
| React Leaflet + Leaflet | ^5.0.0 / ^1.9.4 | **Simplified** map: pin display only (no `georaster`/GeoTIFF libraries) |
| Zustand | ^5.0.15 | Global state (auth, language, listing filters) |
| Axios | ^1.14.0 | HTTP client to Node/Express backend |
| React Native Chart Kit | ^6.12.0 | Admin dashboard charts (deal/commission stats) |

**Dropped:** `@rnmapbox/maps` (unless retained for native map pins), `georaster`, `georaster-layer-for-leaflet`, `firebase`.

### 6.2 Backend Stack (new)
| Technology | Purpose |
|---|---|
| Node.js (v18+) + Express.js | REST API server |
| MongoDB + Mongoose | Primary database (users, properties, documents metadata, deals, invites) |
| jsonwebtoken (JWT) | Access/refresh token issuance & verification |
| bcrypt | Password/OTP secret hashing |
| Multer + S3-compatible storage (e.g., AWS S3 / DigitalOcean Spaces) | Document & media upload storage |
| Twilio / MSG91 | SMS OTP delivery |
| Nodemailer or transactional email provider | Email verification, notifications |
| WhatsApp Business API (Meta Cloud API or BSP) | WhatsApp notifications |
| Razorpay / Cashfree | Token payment processing |

**Dropped entirely:** Python, FastAPI, Rasterio, OpenCV, NumPy, Shapely, Pillow, Firebase Auth/Firestore.

### 6.3 Development Requirements
- Node.js v18+
- MongoDB Atlas account or local MongoDB instance
- S3-compatible bucket for document/media storage
- SMS OTP provider account (Twilio/MSG91)
- WhatsApp Business API access
- Payment gateway sandbox account (Razorpay/Cashfree)
- `npm install` for all JS dependencies (frontend + backend)

---

## 7. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Native App                  │
│                (Expo SDK 54 / Router)               │
│                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Search/Map  │  │Dashboard │  │ Advisor Panel  │  │
│  │  Screen     │  │(My Props)│  │  Screen        │  │
│  └──────┬──────┘  └────┬─────┘  └───────┬───────┘  │
│         │              │                │           │
│  ┌──────▼──────────────▼────────────────▼────────┐  │
│  │              Service Layer                     │  │
│  │  propertyService.ts │ dealService.ts           │  │
│  │  authService.ts     │ documentService.ts       │  │
│  └────────────┬──────────────────────────────────┘  │
│               │                                     │
│  ┌────────────▼──────────────────────────────────┐  │
│  │         State Management (Zustand)            │  │
│  │  authStore.ts (JWT) │ languageStore.ts        │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (REST + JWT Bearer)
┌──────────────────────▼──────────────────────────────┐
│           Node.js + Express Backend                 │
│                                                     │
│  /auth/*         (register, login, OTP, refresh)    │
│  /properties/*   (CRUD, search, filter)             │
│  /verification/* (advisor tasks, badges, reports)   │
│  /deals/*        (offers, commission, payments)     │
│  /documents/*    (upload, share-link, watermark)    │
│  /admin/*        (dashboard, reports, audit log)    │
│                                                     │
│  Middleware: JWT auth guard, RBAC, rate limiting    │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼───────────────┐
        ▼              ▼               ▼
   ┌─────────┐   ┌───────────┐   ┌──────────────┐
   │ MongoDB │   │ S3-compat │   │ 3rd-party    │
   │ Atlas   │   │ storage   │   │ SMS/WhatsApp/│
   │         │   │ (docs/    │   │ Payment APIs │
   │         │   │  media)   │   │              │
   └─────────┘   └───────────┘   └──────────────┘
```

---

## 8. Screen & Module Reference (mapped from old → new)

| Old (Landroid) | New (MalikSe) | Change Summary |
|---|---|---|
| `app/(tabs)/index.web.tsx` (GIS Map Screen) | `app/(tabs)/search.tsx` (Property Search Map) | Strip drawing/measurement/layer-toggle logic; keep map rendering + pin click → property detail |
| `app/(tabs)/dashboard.tsx` | `app/(tabs)/my-properties.tsx` (Owner) / `app/(tabs)/saved.tsx` (Buyer) | Same card-list pattern, fields swapped to property summary + verification badge |
| `app/(tabs)/users.tsx` | `app/(tabs)/advisor-tasks.tsx` (Advisor) / `app/(admin)/assign-advisor.tsx` (Admin) | Invite pattern reused for assigning advisors to listings instead of inviting landowners |
| `src/store/authStore.ts` | `src/store/authStore.ts` | Same shape; `setUser`/`setAuthState` now populated from JWT decode + `/auth/me` call instead of Firebase listener |
| `src/services/parcelService.ts` | `src/services/propertyService.ts` | Same CRUD function names/shapes, now calling REST endpoints instead of AsyncStorage/Firestore |
| `src/services/valuationEngine.ts` | *(removed)* | Not applicable to MalikSe |
| `src/services/planetary.ts` | *(removed)* | Not applicable |
| `src/screens/LandHealthDashboard.tsx` | *(removed)* | Not applicable |
| `mlModel/main.py` (FastAPI tile/CV server) | *(removed)* | Replaced by Node/Express backend |
| Document Vault (`VaultDocumentType`) | Same pattern, types changed to: Registry, Mutation, LPC/Jamabandi, Map, Rent Receipt, Owner ID Proof | |
| `components/MiniMapPreview.tsx` | Same component, renders a single property pin (no polygon) | |
| `components/BottomNav.tsx` | Same, tabs relabeled for marketplace navigation | |

---

## 9. API Contract Reference

### POST `/auth/register`
```json
{
  "role": "owner",
  "name": "Ramesh Kumar",
  "mobile": "+91XXXXXXXXXX",
  "email": "ramesh@example.com"
}
```
Response: OTP sent confirmation.

### POST `/auth/verify-otp`
```json
{ "mobile": "+91XXXXXXXXXX", "otp": "123456" }
```
Response (200 OK):
```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>",
  "user": { "id": "...", "role": "owner", "name": "Ramesh Kumar" }
}
```

### POST `/properties`
Auth required (Bearer JWT, role: owner). Creates a new listing in "Pending Verification" status.

### GET `/properties/search?location=&budgetMin=&budgetMax=&type=&verifiedOnly=true`
Returns paginated list of published, matching listings.

### POST `/properties/:id/verification/advisor-report`
Auth required (role: advisor). Submits GPS check-in, checklist, photos, and report notes for a listing.

### POST `/deals/:propertyId/offer`
Auth required (role: buyer). Submits an offer amount; triggers owner notification.

### POST `/deals/:dealId/payment/token`
Initiates token payment via payment gateway; returns payment session/link.

### GET `/admin/dashboard/summary`
Auth required (role: admin). Returns counts of owners/buyers/properties, pending/verified/rejected listings, deal & commission summary.

*(Full request/response schemas to be finalized during API design sprint — this section gives the contract shape for planning.)*

---

## 10. Data Models

### User
```typescript
interface User {
  id: string;
  role: "owner" | "buyer" | "advisor" | "admin" | "lawyer" | "surveyor" | "bank_rep";
  name: string;
  mobile: string;
  email?: string;
  passwordHash?: string;        // for admin/advisor login if not OTP-only
  kycDocuments?: string[];      // references to Document records
  isVerifiedIdentity: boolean;
  createdAt: string;
}
```

### Property
```typescript
interface Property {
  id: string;
  ownerId: string;
  jointOwnerIds?: string[];
  type: "land" | "flat" | "house" | "shop" | "office";
  location: {
    state: string; district: string; block: string; mauza: string; policeStation: string;
    lat: number; lng: number;
  };
  khata?: string; khesra?: string; holdingNumber?: string;
  totalArea: number; sellableArea: number;
  boundary?: string;             // chauhaddi description
  roadWidth?: number;
  price: number; negotiable: boolean;
  media: { photos: string[]; videos: string[] };
  documents: string[];           // Document references
  disclosures?: { hasLoan: boolean; hasDispute: boolean; possessionStatus: string };
  status: "pending" | "correction_required" | "rejected" | "verified" | "sold";
  badges: {
    identityVerified: boolean;
    documentsChecked: boolean;
    siteVisited: boolean;
    lawyerReviewed: boolean;
    fullyVerified: boolean;
  };
  createdAt: string;
}
```

### Document
```typescript
interface Document {
  id: string;
  propertyId: string;
  type: "Registry" | "Mutation" | "LPC/Jamabandi" | "Map" | "Rent Receipt" | "Owner ID Proof";
  fileUrl: string;               // S3-compatible storage URL
  watermarked: boolean;
  uploadedBy: string;
  createdAt: string;
}
```

### Deal
```typescript
interface Deal {
  id: string;
  propertyId: string;
  buyerId: string;
  ownerId: string;
  offerAmount: number;
  status: "offered" | "countered" | "accepted" | "rejected" | "token_paid" | "completed" | "cancelled";
  commissionAmount: number;      // 1% + tax, computed per side
  tokenPaymentRef?: string;
  registryDateEstimate?: string;
  createdAt: string;
}
```

### AdvisorReport
```typescript
interface AdvisorReport {
  id: string;
  propertyId: string;
  advisorId: string;
  gpsCheckIn: { lat: number; lng: number; timestamp: string };
  checklist: Record<string, boolean>;
  photos: string[];
  notes: string;
  signature: string;             // digital signature reference
  submittedAt: string;
}
```

---

## 11. External Integrations

| Service | Purpose | Status |
|---|---|---|
| SMS OTP Provider (Twilio/MSG91) | Mobile OTP login | To integrate |
| Email Provider (SMTP/SendGrid) | Email verification, notifications | To integrate |
| WhatsApp Business API | Notifications, alerts | To integrate |
| Payment Gateway (Razorpay/Cashfree) | Token payment for deals | To integrate |
| S3-compatible Object Storage | Document & media storage | To integrate |
| Google Maps / OpenStreetMap | Property location pin display | Reused (Leaflet + basemap, no drone overlay) |

---

## 12. Deployment & Setup

**Prerequisites**
- Node.js v18+
- MongoDB Atlas account or local instance
- S3-compatible bucket credentials
- SMS OTP provider account
- WhatsApp Business API access
- Payment gateway sandbox keys

**Step 1 — Install dependencies**
```bash
npm install          # frontend (Expo app)
cd server && npm install   # backend (Express API)
```

**Step 2 — Configure environment**
```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
MONGO_URI=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
SMS_PROVIDER_KEY=
WHATSAPP_API_KEY=
PAYMENT_GATEWAY_KEY=
```

**Step 3 — Start backend**
```bash
cd server
npm run dev     # starts Express API (e.g., on :5000)
```

**Step 4 — Run the app**
```bash
npm run web       # Web
npm run android   # Android
```

---

## 13. MVP Scope & Build Phases

### Phase 1 — MVP (matches earlier MalikSe MVP list)
1. Owner & Buyer registration/login (JWT + OTP)
2. Owner KYC
3. Property listing form
4. Document upload
5. Advisor verification panel (checklist + GPS check-in + report)
6. Admin approval workflow
7. Verified badge display
8. Property search + filters (with simple pin map)
9. Contact Owner request flow
10. Site visit booking
11. Offer & deal status tracking
12. 1% commission agreement display
13. Payment receipt generation
14. WhatsApp/SMS notifications
15. Admin dashboard (summary view)

### Phase 2 — Post-MVP
- Compare listings side by side
- Buyer "post requirement" reverse listings
- In-app chat with advisor added to thread
- Lawyer/Surveyor/Bank Representative roles
- Full CSV/Excel export reporting
- 2FA for Admin
- Automated document watermarking pipeline
- Fraud/spam detection heuristics
