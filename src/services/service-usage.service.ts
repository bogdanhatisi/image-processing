import redisClient from "../redis-client";
import fs from "fs";
import path from "path";

const IMAGES_DIR = path.join(__dirname, "../images");

export const getServiceResponseStats = async () => {
  const averageResponseTime = parseFloat(
    (await redisClient.get("averageResponseTime")) || "0"
  );
  const successfulResponses =
    (await redisClient.get("successfulResponses")) || "0";
  const errorResponses = (await redisClient.get("errorResponses")) || "0";
  const totalResponses =
    parseInt(successfulResponses) + parseInt(errorResponses);
  const errorRate =
    totalResponses > 0 ? (parseInt(errorResponses) / totalResponses) * 100 : 0;

  return {
    averageResponseTime: `${averageResponseTime.toFixed(2)} ms`,
    successfulResponses,
    errorResponses,
    totalResponses,
    errorRate: `${errorRate.toFixed(2)}%`,
  };
};

export const getServiceUsageStats = async () => {
  // Total number of original image files
  const totalImages = fs.readdirSync(IMAGES_DIR).length;

  // Count of images that have been resized
  const imagesResizedCount =
    (await redisClient.get("imagesResizedCount")) || "0";

  // Cache hit-and-miss ratios
  const cacheHits = (await redisClient.get("cacheHits")) || "0";
  const cacheMisses = (await redisClient.get("cacheMisses")) || "0";
  const totalCacheAccesses = parseInt(cacheHits) + parseInt(cacheMisses);
  const cacheHitRatio =
    totalCacheAccesses > 0
      ? (parseInt(cacheHits) / totalCacheAccesses) * 100
      : 0;
  const cacheMissRatio =
    totalCacheAccesses > 0
      ? (parseInt(cacheMisses) / totalCacheAccesses) * 100
      : 0;

  return {
    totalOriginalImages: totalImages,
    imagesResizedCount,
    cacheHitRatio: `${cacheHitRatio.toFixed(2)}%`,
    cacheMissRatio: `${cacheMissRatio.toFixed(2)}%`,
  };
};
