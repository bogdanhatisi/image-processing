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

  // Define a cleanup function to be called on response finish
  const onFinish = async () => {
    updateResponseTimeMetric(res.locals.startTime); // Update the metric after the response has been sent
    res.removeListener("finish", onFinish); // Remove the listener to avoid memory leak
  };

  res.on("finish", onFinish); // Attach the listener to the response's finish event
  try {
    if (!imagePath) throw new Error("Image path not found");
    let processedImage = await processImage(imagePath, resolution);

    updateHttpErrorRates(200);
    res.type(`image/${path.extname(imagePath).slice(1)}`);
    res.send(processedImage);
  } catch (error) {
    console.error(error);
    updateHttpErrorRates(500);
    res.status(500).send("Failed to process image");
  }
};
