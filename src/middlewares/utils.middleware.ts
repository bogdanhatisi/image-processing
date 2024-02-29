import { RequestHandler, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { RequestWithImagePath } from "../models/request.model";
const IMAGES_DIR = path.join(__dirname, "../images");

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

// Middleware to track start time of each request
export const trackStartTime: RequestHandler = (req, res, next) => {
  res.locals.startTime = process.hrtime();

  next();
};
