import { Router } from "express";
import { Deal } from "../models/Deal.model";
import { Property } from "../models/Property.model";
import { User } from "../models/User.model";
import { authGuard, roleGuard } from "../middleware/auth.middleware";

const router = Router();

// POST /deals/:propertyId/offer (Buyer)
router.post("/:propertyId/offer", authGuard, roleGuard("user"), async (req: any, res) => {
  try {
    const buyer = await User.findById(req.user.id);
    if (!buyer?.demoKycComplete) return res.status(403).json({ message: "Complete the demo KYC step before making an offer" });
    const { amount } = req.body;
    const propertyId = req.params.propertyId;
    
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });
    if (property.status !== "verified" || property.advisorReview?.decision !== "approve" || property.verifierReview?.decision !== "approve") return res.status(409).json({ message: "Offers are available only for fully approved published properties" });
    if (property.ownerId.toString() === req.user.id) return res.status(400).json({ message: "You cannot make an offer on your own property" });
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: "Enter a positive offer amount" });

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
