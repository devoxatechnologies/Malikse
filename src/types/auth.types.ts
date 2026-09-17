/**
 * MalikSe — Auth Types
 */

export type UserRole = "owner" | "buyer" | "advisor" | "admin" | "lawyer" | "surveyor" | "bank_rep";

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  isVerifiedIdentity: boolean;
  kycDocuments?: string[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
