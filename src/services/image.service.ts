import redisClient from "../redis-client";
import sharp from "sharp";
import path from "path";

const IMAGES_DIR = path.join(__dirname, "../images");

export const updateResponseTimeMetric = async (startTime: [number, number]) => {
  const diff = process.hrtime(startTime);

  const responseTime = diff[0] * 1000 + diff[1] / 1e6;

  const currentAverage =
    Number(await redisClient.get("averageResponseTime")) || 0;
  const totalCount = await redisClient.incr("responseCount");
  const newAverage =
    (currentAverage * (totalCount - 1) + responseTime) / totalCount;

  await redisClient.set("averageResponseTime", newAverage.toString());
};

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

  await redisClient.set(cacheKey, processedImage.toString("base64"), {
    EX: 3600,
  });
  await redisClient.incr("imagesResizedCount");
  console.log("Serving freshly processed");
  return processedImage;
};
