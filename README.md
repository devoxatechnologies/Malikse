# MalikSe — Verified Owner-to-Buyer Property Marketplace

MalikSe uses four roles: **User** (buying and selling), **Advisor**, **Verifier**, and **Admin**.

## Current account and verification flow

- Login and registration open the verified marketplace. The Profile button opens the signed-in account's role dashboard; **My profile** there opens account details and logout.
- Users complete the explicitly labeled demo KYC step, then fill in property details, location/boundaries, and optional ownership documents. Web supports boundary drawing; mobile supports GPS capture or manual coordinates.
- The final submission saves a draft, uploads selected documents, and submits it to the Advisor queue. Failed uploads retain the draft; errors never advance in preview mode. Photo/video URLs are supported in this skeleton; a media upload pipeline is not yet included.
- New submissions are assigned to an available Advisor with the smallest pending queue. Advisor approval assigns an available Verifier. If no reviewer exists, the property stays unassigned and can be claimed after a staff account is created. Admin can assign or reassign pending reviews.
- Advisors and Verifiers see their assigned properties, seller records, protected documents, checklists and reports. Unassigned queues show only summaries until claimed.
- Both stages can approve, request corrections, or reject with signed notes. Seller corrections restart Advisor review; previous reports remain in history. Rejected listings cannot be resubmitted through this flow.
- Only final Verifier approval publishes a listing. Public search and details require both recorded approvals and expose neither private seller contact details nor documents/reports. Fully Verified is not a legal-title guarantee.
- Submitted or published listings cannot be silently edited. Reviewer decisions use version checks, preventing duplicate approvals or concurrent overwrites. History stores actor, role, timestamp, old/new status and report snapshots.
- Ownership documents are optional and restricted to the owner, assigned reviewers and Admin, with expiring download links. KYC remains a demo. OTP, payments, legal title guarantees and other planned requirements are not implemented by this workflow.

### Roles

- **User:** browse, create listings, correct/resubmit and track reviews.
- **Advisor:** first-stage review; cannot publish.
- **Verifier:** final review and publication after Advisor approval.
- **Admin:** create staff accounts, assign reviews and inspect all property history; cannot bypass final Verifier approval.

### Verify the workflow

With MongoDB available, run `npm --prefix server run test:workflow`. The test uses a uniquely named temporary database and deletes only its own test database and uploaded fixture when finished. It exercises role restrictions, assignment, both correction loops, duplicate approvals, optional documents, protected downloads and publication.

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 57), TypeScript, Expo Router.
- **Web Support**: React Native Web with Leaflet integration for property pins.
- **State Management**: Zustand (Auth, Language, Listing Filters).
- **Backend**: Node.js (Express) REST API.
- **Database**: MongoDB (via Mongoose) for users, properties, deals, and document metadata.
- **Authentication**: JWT-based session management (Access + Refresh token rotation) with bcrypt hashing.

## 🏗 Project Structure

```text
malikse/
├── app/                 # Expo / React Native application
│   ├── app/             # Expo Router screens (auth, tabs, admin, advisor)
│   ├── src/             # Components, services, stores, and hooks
│   ├── assets/          # Application images and fonts
│   └── package.json     # Frontend dependencies and commands
├── server/              # Node.js + Express backend
│   ├── src/             # API routes, models, middleware, and index.ts
│   ├── uploads/         # Uploaded documents served by the API
│   └── package.json     # Backend dependencies and commands
└── website/             # Reserved for the future standalone website
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   # Install frontend dependencies
   npm --prefix app install

   # Install backend dependencies
   npm --prefix server install
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
   Set `ADMIN_NAME`, `ADMIN_MOBILE`, and `ADMIN_PASSWORD` (at least 6 characters) in `server/.env` to create the first Admin. `ADMIN_EMAIL` is optional. Configure the app API address in `app/.env`; the example is in `app/.env.example`. Expo Go on a phone uses the Metro host for a localhost API URL, so the phone and server should be on the same network.

   Create the Admin once:
   ```bash
   npm --prefix server run seed:admin
   ```
   The seed is idempotent for the configured Admin mobile and does not overwrite an existing password.

3. **Start the Backend Server**:
   ```bash
   npm --prefix server run dev
   ```

4. **Run the Application (Frontend)**:
   Open a new terminal at the project root:
   ```bash
   # For Web
   npm --prefix app run web
   
   # For Android
   npm --prefix app run android
   ```

Users register from the app and are signed in immediately. The Admin signs in with the seeded mobile number and password, then clicks Profile and opens **Advisors and Verifiers** on the Admin dashboard to create staff accounts. Staff sign in through the same login screen with the credentials the Admin set. Registration does not create staff or Admin accounts.

---
**Note:** This project is adapted from an earlier GIS/drone codebase (Landroid). All previous mapping layers and AI modules have been removed to focus entirely on the verified property marketplace functionality.
