import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import documentRoutes from "./routes/document.routes";
import dealRoutes from "./routes/deal.routes";
import advisorRoutes from "./routes/advisor.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (local disk mode)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/documents", documentRoutes);
app.use("/deals", dealRoutes);
app.use("/verification", advisorRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "MalikSe API" }));

// ── Database ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/malikse";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[MalikSe] MongoDB connected`);
    app.listen(PORT, () => {
      console.log(`[MalikSe] Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[MalikSe] MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
