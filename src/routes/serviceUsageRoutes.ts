import express from "express";
import {
  getServiceResponseStats,
  getServiceUsageStats,
} from "../controllers/serviceUsageController";

const router = express.Router();

router.get("/usage-stats", getServiceUsageStats);
router.get("/response-stats", getServiceResponseStats);

export default router;
