import redisClient from "../redis-client";
import sharp from "sharp";
import path from "path";

const IMAGES_DIR = path.join(__dirname, "../images");

// Function to calculate response time and update metrics
export const updateResponseTimeMetric = async (startTime: [number, number]) => {
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
export const updateHttpErrorRates = async (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 400) {
    await redisClient.incr("successfulResponses");
  } else if (statusCode >= 400) {
    await redisClient.incr("errorResponses");
  }
};

export const processImage = async (
  imagePath: string,
  resolution: any
): Promise<Buffer> => {
  const cacheKey = `image:${path.basename(imagePath)}:res:${resolution}`;

  // Check if image is in Redis cache
  const cachedImage = await redisClient.get(cacheKey);
  if (cachedImage) {
    console.log("Serving from cache");
    await redisClient.incr("cacheHits");
    return Buffer.from(cachedImage, "base64");
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
  return processedImage;
};
