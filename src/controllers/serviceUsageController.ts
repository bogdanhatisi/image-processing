import { Request, Response } from "express";
import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import redisClient from "../redisClient";

const IMAGES_DIR = path.join(__dirname, "../images");

// Middleware to track start time of each request
export const trackStartTime: RequestHandler = (req, res, next) => {
  res.locals.startTime = process.hrtime();
  console.log("DECENUSEAPELEAZA", res.locals.startTime);
  next();
};

export const getServiceResponseStats = async (req: Request, res: Response) => {
  try {
    const averageResponseTime = parseFloat(
      (await redisClient.get("averageResponseTime")) || "0"
    );
    const successfulResponses =
      (await redisClient.get("successfulResponses")) || "0";
    const errorResponses = (await redisClient.get("errorResponses")) || "0";
    const totalResponses =
      parseInt(successfulResponses) + parseInt(errorResponses);
    const errorRate =
      totalResponses > 0
        ? (parseInt(errorResponses) / totalResponses) * 100
        : 0;
    res.json({
      averageResponseTime: `${averageResponseTime.toFixed(2)} ms`,
      successfulResponses,
      errorResponses,
      totalResponses,
      errorRate: `${errorRate.toFixed(2)}%`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve service response stats");
  }
};

export const getServiceUsageStats = async (req: Request, res: Response) => {
  try {
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

    res.json({
      totalOriginalImages: totalImages,
      imagesResizedCount,
      cacheHitRatio: `${cacheHitRatio.toFixed(2)}%`,
      cacheMissRatio: `${cacheMissRatio.toFixed(2)}%`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve service usage stats");
  }
};
