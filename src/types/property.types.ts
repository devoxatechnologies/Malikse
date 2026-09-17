/**
 * MalikSe — Property Types
 */

export type PropertyType = "land" | "flat" | "house" | "shop" | "office";
export type PropertyStatus = "pending" | "correction_required" | "rejected" | "verified" | "sold";

export interface PropertyBadges {
  identityVerified: boolean;
  documentsChecked: boolean;
  siteVisited: boolean;
  lawyerReviewed: boolean;
  fullyVerified: boolean;
}

export interface PropertyLocation {
  state: string;
  district: string;
  block: string;
  mauza: string;
  policeStation: string;
  lat: number;
  lng: number;
}

export interface PropertyDisclosures {
  hasLoan: boolean;
  hasDispute: boolean;
  possessionStatus: string;
}

export interface Property {
  id: string;
  ownerId: string;
  jointOwnerIds?: string[];
  type: PropertyType;
  location: PropertyLocation;
  parcelPoints?: { lat: number; lng: number }[];
  khata?: string;
  khesra?: string;
  holdingNumber?: string;
  totalArea: number;       // in sq ft or sq m
  sellableArea: number;
  boundary?: string;       // chauhaddi description
  roadWidth?: number;
  price: number;           // in INR
  negotiable: boolean;
  media: {
    photos: string[];      // S3/GridFS URLs
    videos: string[];
  };
  documents: string[];     // Document IDs
  disclosures?: PropertyDisclosures;
  status: PropertyStatus;
  badges: PropertyBadges;
  createdAt: string;
  // Populated fields (from server joins)
  ownerName?: string;
  locationName?: string;   // Human-readable address
}

export interface PropertySearchFilters {
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  type?: PropertyType;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}
