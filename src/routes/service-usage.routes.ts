import express from "express";
import {
  getServiceResponseStatsController,
  getServiceUsageStatsController,
} from "../controllers/service-usage.controller";

const router = express.Router();

router.get("/usage-stats", getServiceUsageStatsController);
router.get("/response-stats", getServiceResponseStatsController);

export default router;
