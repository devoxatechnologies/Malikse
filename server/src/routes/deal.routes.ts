import { Router } from "express";
import { Deal } from "../models/Deal.model";
import { Property } from "../models/Property.model";
import { authGuard, roleGuard } from "../middleware/auth.middleware";

const router = Router();

// POST /deals/:propertyId/offer (Buyer)
router.post("/:propertyId/offer", authGuard, roleGuard("buyer"), async (req: any, res) => {
  try {
    const { amount } = req.body;
    const propertyId = req.params.propertyId;
    
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const commissionAmount = amount * 0.0118; // 1% + 18% GST

    const deal = new Deal({
      propertyId,
      buyerId: req.user.id,
      ownerId: property.ownerId,
      offerAmount: amount,
      commissionAmount,
      status: "offered"
    });

    await deal.save();
    res.status(201).json(deal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /deals/:id
router.get("/:id", authGuard, async (req: any, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("propertyId")
      .populate("buyerId", "name")
      .populate("ownerId", "name");
      
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    
    // Simple auth check
    if (deal.buyerId._id.toString() !== req.user.id && 
        deal.ownerId._id.toString() !== req.user.id && 
        req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(deal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /deals/:id/status
router.patch("/:id/status", authGuard, async (req: any, res) => {
  try {
    const { status } = req.body;
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    
    // Allow owner to accept/reject
    if (deal.ownerId.toString() === req.user.id && ["accepted", "rejected", "countered"].includes(status)) {
       deal.status = status;
       await deal.save();
       return res.json(deal);
    }
    
    if (req.user.role === "admin") {
      deal.status = status;
      await deal.save();
      return res.json(deal);
    }
    
    res.status(403).json({ message: "Unauthorized to change status" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
