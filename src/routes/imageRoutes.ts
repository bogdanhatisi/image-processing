import express from "express";
import {
  checkImageExists,
  processImageRequest,
} from "../controllers/imageController";
import { trackStartTime } from "../controllers/serviceUsageController";

const router = express.Router();

router.get(
  "/:imageName",
  trackStartTime,
  checkImageExists,
  processImageRequest
);

export default router;
