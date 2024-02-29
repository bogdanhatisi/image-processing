import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import redisClient from "../redisClient";

const IMAGES_DIR = path.join(__dirname, "../images");

interface RequestWithImagePath extends Request {
  imagePath?: string;
}
// Function to calculate response time and update metrics
const updateResponseTimeMetric = async (startTime: [number, number]) => {
  const diff = process.hrtime(startTime);

  const responseTime = diff[0] * 1000 + diff[1] / 1e6; // Convert to milliseconds

  // Here you would calculate the new average based on the current average and count
  // This is a simplified approach; for production use, consider a more sophisticated method
  const currentAverage =
    Number(await redisClient.get("averageResponseTime")) || 0;
  const totalCount = await redisClient.incr("responseCount");
  const newAverage =
    (currentAverage * (totalCount - 1) + responseTime) / totalCount;

  await redisClient.set("averageResponseTime", newAverage.toString());
};

// Function to increment error/success counters
const updateHttpErrorRates = async (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 400) {
    await redisClient.incr("successfulResponses");
  } else if (statusCode >= 400) {
    await redisClient.incr("errorResponses");
  }
};

export const checkImageExists = (
  req: RequestWithImagePath,
  res: Response,
  next: NextFunction
) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(IMAGES_DIR, imageName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  req.imagePath = imagePath;
  next();
};

export const processImageRequest = async (
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
    const cacheKey = `image:${path.basename(imagePath)}:res:${resolution}`;

    // Check if image is in Redis cache
    const cachedImage = await redisClient.get(cacheKey);
    if (cachedImage) {
      console.log("Serving from cache");
      await redisClient.incr("cacheHits");
      return res.send(Buffer.from(cachedImage, "base64"));
    }

    let image = sharp(imagePath);
    if (resolution !== "original") {
      const [width, height] = resolution.toString().split("x").map(Number);
      image = image.resize(width || undefined, height || undefined);
    }

    await redisClient.incr("cacheMisses");

    const processedImage = await image.toBuffer();
    // Store the processed image in Redis cache, converting buffer to base64
    await redisClient.set(cacheKey, processedImage.toString("base64"), {
      EX: 3600, // Expires in 1 hour
    });
    await redisClient.incr("imagesResizedCount");
    console.log("Serving freshly processed");
    updateHttpErrorRates(200);
    res.type(`image/${path.extname(imagePath).slice(1)}`);
    res.send(processedImage);
  } catch (error) {
    console.error(error);
    updateHttpErrorRates(500);
    res.status(500).send("Failed to process image");
  }
};
