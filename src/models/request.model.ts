import { Request } from "express";

export interface RequestWithImagePath extends Request {
  imagePath?: string;
}
