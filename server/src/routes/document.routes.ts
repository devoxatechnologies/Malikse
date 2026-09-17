import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PropertyDocument } from "../models/Document.model";
import { Property } from "../models/Property.model";
import { authGuard } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// POST /documents
router.post("/", authGuard, upload.single("file"), async (req: any, res) => {
  try {
    const { propertyId, type } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Validate ownership or admin/advisor role (simplified for MVP)
    if (property.ownerId.toString() !== req.user.id && !["admin", "advisor"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized to upload to this property" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    const doc = new PropertyDocument({
      propertyId,
      type,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileUrl,
      uploadedBy: req.user.id
    });
    
    await doc.save();
    
    // Add doc to property
    property.documents.push(doc._id);
    await property.save();

    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /documents?propertyId=...
router.get("/", authGuard, async (req: any, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });
    
    const docs = await PropertyDocument.find({ propertyId }).sort("-createdAt");
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /documents/:id/share-link
router.post("/:id/share-link", authGuard, async (req: any, res) => {
  try {
    const doc = await PropertyDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours

    doc.shareToken = token;
    doc.shareExpiresAt = expiresAt;
    await doc.save();

    res.json({ token, expiresAt, docId: doc._id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
