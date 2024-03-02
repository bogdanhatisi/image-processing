import request from "supertest";
import express from "express";
import serviceUsageRouter from "../src/routes/service-usage.routes";

jest.mock("../src/controllers/service-usage.controller", () => ({
  getServiceUsageStatsController: jest.fn((req, res) => {
    const mockUsageStatsData = {
      totalOriginalImages: 100,
      imagesResizedCount: 75,
      cacheHitRatio: "85.00%",
      cacheMissRatio: "15.00%",
    };
    res.status(200).json({
      message: "Success",
      data: mockUsageStatsData,
    });
  }),
  getServiceResponseStatsController: jest.fn((req, res) => {
    const mockResponseStatsData = {
      averageResponseTime: "50 ms",
      successfulResponses: 2000,
      errorResponses: 50,
      totalResponses: 2050,
      errorRate: "2.44%",
    };
    res.status(200).json({
      message: "Success",
      data: mockResponseStatsData,
    });
  }),
}));

const app = express();
app.use(express.json());
app.use("/", serviceUsageRouter);

describe("GET /usage-stats", () => {
  test("should respond with 200 status code and JSON data", async () => {
    const response = await request(app).get("/usage-stats");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("application/json");
    expect(response.body).toHaveProperty("message", "Success");
  });
});

describe("GET /response-stats", () => {
  test("should respond with 200 status code and JSON data", async () => {
    const response = await request(app).get("/response-stats");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("application/json");
    expect(response.body).toHaveProperty("message", "Success");
  });
});
