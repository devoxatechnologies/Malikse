import { Router } from "express";
import { User } from "../models/User.model";
import { Property } from "../models/Property.model";
import { Deal } from "../models/Deal.model";
import { authGuard, roleGuard } from "../middleware/auth.middleware";

const router = Router();

// GET /admin/dashboard/summary
router.get("/dashboard/summary", authGuard, roleGuard("admin"), async (req, res) => {
  try {
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });
    const totalProperties = await Property.countDocuments();
    
    const pendingProperties = await Property.countDocuments({ status: "pending" });
    const verifiedProperties = await Property.countDocuments({ status: "verified" });
    const rejectedProperties = await Property.countDocuments({ status: "rejected" });
    
    const activeDeals = await Deal.countDocuments({ status: { $nin: ["completed", "cancelled", "rejected"] } });
    
    // Sum total commissions for completed deals
    const completedDeals = await Deal.find({ status: "completed" });
    const commissionEarned = completedDeals.reduce((sum, deal) => sum + (deal.commissionAmount * 2), 0); // Both sides

    res.json({
      users: { owners: totalOwners, buyers: totalBuyers },
      properties: { total: totalProperties, pending: pendingProperties, verified: verifiedProperties, rejected: rejectedProperties },
      deals: { active: activeDeals },
      financials: { commissionEarned }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /admin/properties (for queues)
router.get("/properties", authGuard, roleGuard("admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const properties = await Property.find(query).populate("ownerId", "name mobile").sort("-createdAt");
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
