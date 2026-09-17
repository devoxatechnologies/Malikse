import mongoose, { Document, Schema } from "mongoose";

export interface IAdvisorReport extends Document {
  propertyId: mongoose.Types.ObjectId;
  advisorId: mongoose.Types.ObjectId;
  gpsCheckIn: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  checklist: Record<string, boolean>;
  photos: string[];
  notes: string;
  signature?: string;
  submittedAt: Date;
}

const AdvisorReportSchema = new Schema<IAdvisorReport>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    advisorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gpsCheckIn: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      timestamp: { type: Date, required: true },
    },
    checklist: { type: Map, of: Boolean, default: {} },
    photos: { type: [String], default: [] },
    notes: { type: String, default: "" },
    signature: String,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AdvisorReport = mongoose.model<IAdvisorReport>("AdvisorReport", AdvisorReportSchema);
