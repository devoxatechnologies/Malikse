# Landroid: AI-Powered Land Intelligence Platform

Landroid is an AI-powered mobile application designed for land health monitoring, plant intelligence, and land valuation. Built for the Birdscale × VIT Chennai Hackathon, it leverages drone-captured geospatial data and open environmental APIs to provide actionable insights for Land Consultants and Landowners.

## 🚀 Project Overview

Landroid solves the challenge of fragmented land ownership monitoring by providing a unified digital interface for boundary visualization, health monitoring (NDVI, soil, weather), and AI-driven valuation.

### Core Objectives
- **GIS Map Viewer**: High-resolution drone orthomosaics and multi-layer GIS toggles.
- **Land Health Dashboard**: Composite score derived from real-time environmental signals.
- **Tree & Canopy Analytics**: Individual tree detection and health assessment.
- **Land Valuation**: Intelligence-based estimation of land value.
- **Document Vault**: Secure, access-controlled storage for land records.

---

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 54), TypeScript, Expo Router.
- **Web Support**: React Native Web with Leaflet integration.
- **Backend**: Node.js (Express), Firebase Firestore, Firebase Authentication.
- **Database**: MongoDB (via Mongoose) for the Document Vault.
- **GIS/Maps**: `@rnmapbox/maps`, `georaster`, `react-leaflet`.
- **APIs**:
    - **Microsoft Planetary Computer**: Sentinel-2 (NDVI), CHIRPS (Rainfall), ERA5 (Temp).
    - **ISRIC SoilGrids**: Global soil pH, Carbon, and Texture data.
    - **OSM Overpass**: Proximity signals (highways, water bodies).
    - **OSM Nominatim**: Reverse geocoding.

---

## ✅ Implemented Features (SRS Alignment)

The following features have been implemented based on the **Software Requirements Specification (SRS v1.4)**:

### 1. Authentication & Onboarding
- [x] **FR-01 to FR-03**: Mobile OTP and Google Sign-In via Firebase Auth. Role-based onboarding (Consultant vs. Landowner).
- [x] **FR-04 to FR-05**: Secure session management and Bearer token API protection.

### 2. Parcel Management (Consultant Only)
- [x] **FR-06 & FR-07**: Parcel record creation with simulated GeoTIFF upload and boundary confirmation.
- [x] **FR-08**: Automatic derivation of centroid and bounding box from GeoJSON boundaries.
- [x] **FR-09**: **Foundation API Flow** — Parallel background fetches from OSM, SoilGrids, and Planetary Computer.
- [x] **FR-10**: Parcel assignment via email/phone and role-based access control.

### 3. GIS Map Viewer
- [x] **FR-11 to FR-14**: Interactive satellite map with layer toggling (Orthomosaic, Boundary, NDVI).
- [x] **FR-15**: Measurement tools for point coordinates and area calculation.
- [x] **FR-16**: Parcel health badge (Healthy/Moderate/At Risk) visible on the map.

### 4. AI Modules
- [x] **FR-18 to FR-24: Land Health Dashboard**: 
    - Real-time environmental signal aggregation. 
    - Composite Land Health Score (0-100) computation.
    - Confidence scores per signal.
- [x] **FR-29 to FR-33: Tree & Canopy Count**:
    - Pure OpenCV watershed segmentation for individual canopy detection.
    - Stress classification, density per acre, and confidence scoring.
    - No external API or pre-trained model required.
- [x] **FR-34 to FR-38: Land Valuation (v2)**:
    - AI Engine deriving value ranges from 5+ signals (Soil, Rainfall, Proximity, etc.).
    - Top 3 driving factor analysis.
    - Intelligence-range labeling (FR-36).

### 5. Document Vault
- [x] **FR-44 to FR-47**: 
    - Multi-format support (PDF, TIFF, PNG/JPG). 
    - Access-controlled document retrieval via MongoDB.
    - **Time-limited sharing** (valid for 48 hours).

---

## 🏗 Project Structure

```text
landroid/
├── app/                 # Expo Router (file-based routing)
│   ├── (auth)/         # Login, OTP, and Onboarding screens
│   └── (tabs)/         # Main Dashboard, Map, and Vault
├── scripts/            # Backend & Utility scripts
│   └── mongo-server.js # Document Vault API server
├── src/
│   ├── components/     # UI Components (Cards, Gauges, MapLayers)
│   ├── services/       # Core Logic (Valuation, APIs, Firestore)
│   │   ├── valuationEngine.ts # Land Valuation AI logic
│   │   └── parcelService.ts   # Firestore & API orchestration
│   └── hooks/          # Custom React Hooks (Auth, UI State)
└── assets/             # Images and local datasets
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Firebase Project (Auth & Firestore)
- Microsoft Planetary Computer account (for API activation)

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd landriod
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the `landriod` directory and fill in your credentials:
   ```env
   # Firebase
   EXPO_PUBLIC_FIREBASE_API_KEY=your_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   
   # MongoDB
   MONGO_URI=your_mongodb_connection_string
   ```

3. **Start the Vault Server**:
   ```bash
   node scripts/mongo-server.js
   ```

4. **Run the Application**:
   ```bash
   # For Web
   npm run web
   
   # For Android
   npm run android
   ```

---

## 📝 Disclaimer
This project uses Birdscale proprietary datasets and open APIs for educational/hackathon purposes. All land valuations are estimates for intelligence demonstration only.
