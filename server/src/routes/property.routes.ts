import { Router } from "express";
import { Property } from "../models/Property.model";
import { authGuard, roleGuard } from "../middleware/auth.middleware";

const router = Router();

// GET /properties/search (Public/Buyer)
router.get("/search", async (req, res) => {
  try {
    const { location, type, verifiedOnly, minPrice, maxPrice } = req.query;
    const query: any = { status: "verified" }; // Only show verified by default in search
    
    if (verifiedOnly === "false") {
      delete query.status; // or allow pending if needed
    }
    if (location) {
      // Simple regex search on state or district
      const locRegex = new RegExp(location as string, "i");
      query.$or = [{ "location.state": locRegex }, { "location.district": locRegex }];
    }
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).populate("ownerId", "name").sort("-createdAt").limit(50);
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /properties/mine (Owner)
router.get("/mine", authGuard, roleGuard("owner"), async (req: any, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.id }).sort("-createdAt");
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /properties/:id
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("ownerId", "name mobile");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /properties (Owner)
router.post("/", authGuard, roleGuard("owner"), async (req: any, res) => {
  try {
    const propertyData = { ...req.body, ownerId: req.user.id, status: "pending" };
    const property = new Property(propertyData);
    await property.save();
    res.status(201).json(property);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /properties/:id (Owner)
router.patch("/:id", authGuard, roleGuard("owner"), async (req: any, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      req.body,
      { new: true }
    );
    if (!property) return res.status(404).json({ message: "Property not found or unauthorized" });
    res.json(property);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
