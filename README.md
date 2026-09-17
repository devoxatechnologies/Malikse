# MalikSe — Verified Owner-to-Buyer Property Marketplace

MalikSe is a mobile + web marketplace where **only verified registered owners** can list properties. A company advisor performs document and physical site verification, and verified listings are then published for buyers to discover and contact the owner directly — with the company earning a transparent commission from each side on a successful deal.

## 🚀 Product Vision & Features

Property buying/selling is plagued by fake listings, unverifiable ownership, and middlemen. MalikSe solves this by offering a transparent, verified platform.

### Core Pillars
- **Owner Verification Pipeline**: Multi-stage badge system (Identity → Documents → Site Visit → Lawyer Review) before a listing goes public.
- **Property Listing & Search**: Structured listing form with map location, media, and buyer-side search/filter/compare.
- **Controlled Owner–Buyer Contact**: OTP/KYC-gated "Contact Owner" flow; numbers are hidden until the owner consents.
- **Deal & Commission Tracking**: Offer/counter-offer flow, token payment, auto-generated receipts, and deal status tracking.
- **Advisor Mobile Panel**: GPS check-in, checklist-driven site verification, photo/video upload, and digital sign-off.
- **Document Vault**: Secure, access-controlled storage for registry, mutation, LPC/jamabandi, and other ownership documents.

## 👥 User Roles

- **Seller / Registered Owner**: Register with KYC, list property, upload documents, respond to offers.
- **Buyer**: Search/filter, save favorites, book site visits, send offers, contact owner (post-KYC).
- **Company Advisor**: View assigned tasks, GPS check-in, upload site photos, complete checklist, submit reports.
- **Admin**: Approve/reject listings, assign advisors, manage disputes, view reports.

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 54), TypeScript, Expo Router.
- **Web Support**: React Native Web with Leaflet integration for property pins.
- **State Management**: Zustand (Auth, Language, Listing Filters).
- **Backend**: Node.js (Express) REST API.
- **Database**: MongoDB (via Mongoose) for users, properties, deals, and document metadata.
- **Authentication**: JWT-based session management (Access + Refresh token rotation) with bcrypt hashing.

## 🏗 Project Structure

```text
malikse/
├── app/                 # Expo Router (file-based routing)
│   ├── (auth)/          # Login and Registration screens
│   ├── (tabs)/          # Main Dashboard (Search, Saved, My Properties, Messages)
│   ├── admin/           # Admin layouts and dashboards
│   └── advisor/         # Advisor layouts and dashboards
├── src/
│   ├── components/      # UI Components (Cards, Lists, Modals)
│   ├── services/        # Core API Logic (authService, propertyService, etc.)
│   ├── store/           # Zustand state management
│   └── hooks/           # Custom React Hooks
└── server/              # Node.js + Express Backend
    ├── src/
    │   ├── controllers/ # Request handlers
    │   ├── models/      # Mongoose schemas
    │   ├── routes/      # Express routes (auth, properties, admin, etc.)
    │   └── middleware/  # JWT auth guard, RBAC, etc.
    └── index.ts         # Backend entry point
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the `server` directory and fill in your credentials:
   ```env
   # JWT Secrets
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret

   # MongoDB
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
   *(Configure additional environment variables for Expo in the root directory if necessary).*

3. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   ```

4. **Run the Application (Frontend)**:
   Open a new terminal at the project root:
   ```bash
   # For Web
   npm run web
   
   # For Android
   npm run android
   ```

---
**Note:** This project is adapted from an earlier GIS/drone codebase (Landroid). All previous mapping layers and AI modules have been removed to focus entirely on the verified property marketplace functionality.
