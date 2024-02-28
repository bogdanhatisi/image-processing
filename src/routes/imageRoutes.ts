import express, { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

const router = express.Router();
const imageCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const IMAGES_DIR = path.join(__dirname, "../images");

interface RequestWithImagePath extends Request {
  imagePath?: string;
}

const checkImageExists = (
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

router.get(
  "/:imageName",
  checkImageExists,
  async (req: RequestWithImagePath, res: Response) => {
    const { resolution } = req.query;
    const imagePath = req.imagePath;

    try {
      if (!imagePath) throw new Error("Image path not found");
      const cacheKey = `${imagePath}-${resolution}`;

      // Check if image is in cache
      if (imageCache.has(cacheKey)) {
        const cachedImage = imageCache.get<Buffer>(cacheKey);
        if (cachedImage) {
          res.type(`image/${path.extname(imagePath).slice(1)}`);
          return res.send(cachedImage);
        }
      }

      let image = sharp(imagePath);
      if (resolution) {
        const [width, height] = resolution.toString().split("x").map(Number);
        image = image.resize(width || undefined, height || undefined);
      }

      const processedImage = await image.toBuffer();
      imageCache.set(cacheKey, processedImage); // Cache the processed image
      res.type(`image/${path.extname(imagePath).slice(1)}`);
      res.send(processedImage);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to process image");
    }
  }
);

export default router;
