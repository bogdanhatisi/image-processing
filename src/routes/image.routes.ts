import express from "express";
import { processImageRequestController } from "../controllers/image.controller";
import { trackStartTime } from "../middlewares/utils.middleware";
import { checkImageExists } from "../middlewares/utils.middleware";

const router = express.Router();

router.get(
  "/:imageName",
  trackStartTime,
  checkImageExists,
  processImageRequestController
);

export default router;
