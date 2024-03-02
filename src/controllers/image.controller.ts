import { Response } from "express";
import path from "path";
import {
  processImage,
  updateHttpErrorRates,
  updateResponseTimeMetric,
} from "../services/image.service";
import { RequestWithImagePath } from "../models/request.model";

export const processImageRequestController = async (
  req: RequestWithImagePath,
  res: Response
) => {
  const { resolution = "original" } = req.query;
  const imagePath = req.imagePath;

  const onFinish = async () => {
    updateResponseTimeMetric(res.locals.startTime);
    res.removeListener("finish", onFinish);
  };

  res.on("finish", onFinish);
  try {
    if (!imagePath) throw new Error("Image path not found");
    let processedImage = await processImage(imagePath, resolution);

    updateHttpErrorRates(200);

    res.type(`image/${path.extname(imagePath).slice(1)}`);
    res.send(processedImage);
  } catch (error) {
    updateHttpErrorRates(500);
    res.status(500).send("Failed to process image");
  }
};
