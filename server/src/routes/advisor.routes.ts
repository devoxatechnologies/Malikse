import { Router } from "express";
import { AdvisorReport } from "../models/AdvisorReport.model";
import { Property } from "../models/Property.model";
import { authGuard, roleGuard } from "../middleware/auth.middleware";

const router = Router();

// GET /verification/my-tasks
router.get("/my-tasks", authGuard, roleGuard("advisor"), async (req: any, res) => {
  try {
    // Find properties assigned to this advisor
    const properties = await Property.find({ assignedAdvisorId: req.user.id })
      .populate("ownerId", "name mobile")
      .sort("-createdAt");
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /verification/:propertyId/report
router.post("/:propertyId/report", authGuard, roleGuard("advisor"), async (req: any, res) => {
  try {
    const propertyId = req.params.propertyId;
    const property = await Property.findById(propertyId);
    
    if (!property) return res.status(404).json({ message: "Property not found" });
    if (property.assignedAdvisorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not assigned to this property" });
    }

    const { gpsCheckIn, checklist, notes, photos } = req.body;

    const report = new AdvisorReport({
      propertyId,
      advisorId: req.user.id,
      gpsCheckIn,
      checklist,
      notes,
      photos
    });

    await report.save();
    
    // Update property badges based on report (simplified logic)
    property.badges.siteVisited = true;
    if (checklist?.documentsMatch) property.badges.documentsChecked = true;
    if (property.badges.identityVerified && property.badges.documentsChecked && property.badges.siteVisited) {
      property.badges.fullyVerified = true;
      property.status = "verified"; // Auto-verify for MVP
    }
    await property.save();

    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
