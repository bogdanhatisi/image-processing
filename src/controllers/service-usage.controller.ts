import { Request, Response } from "express";
import {
  getServiceResponseStats,
  getServiceUsageStats,
} from "../services/service-usage.service";

export const getServiceResponseStatsController = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await getServiceResponseStats();
    res.json(stats);
  } catch (error) {
    res.status(500).send("Failed to retrieve service response stats");
  }
};

export const getServiceUsageStatsController = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await getServiceUsageStats();
    res.json(stats);
  } catch (error) {
    res.status(500).send("Failed to retrieve service usage stats");
  }
};
