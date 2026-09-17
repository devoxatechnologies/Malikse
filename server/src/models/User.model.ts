import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  role: "owner" | "buyer" | "advisor" | "admin" | "lawyer" | "surveyor" | "bank_rep";
  name: string;
  mobile: string;
  email?: string;
  passwordHash?: string;
  kycDocuments: string[];
  isVerifiedIdentity: boolean;
  refreshTokenHash?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["owner", "buyer", "advisor", "admin", "lawyer", "surveyor", "bank_rep"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String },
    kycDocuments: { type: [String], default: [] },
    isVerifiedIdentity: { type: Boolean, default: false },
    refreshTokenHash: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
