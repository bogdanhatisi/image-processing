import {
  getServiceUsageStats,
  getServiceResponseStats,
} from "../src/services/service-usage.service";
import fs from "fs";
import redisClient from "../src/redis-client";

jest.mock("fs", () => ({
  readdirSync: jest.fn(),
}));
jest.mock("../src/redis-client", () => ({
  get: jest.fn(),
}));

describe("getServiceUsageStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("correctly calculates and formats service usage statistics", async () => {
    const mockImagesDirFiles = ["image1.jpg", "image2.jpg", "image3.jpg"];
    (fs.readdirSync as jest.Mock).mockReturnValue(mockImagesDirFiles);

    (redisClient.get as jest.Mock)
      .mockResolvedValueOnce("2")
      .mockResolvedValueOnce("100")
      .mockResolvedValueOnce("50");

    const expectedStats = {
      totalOriginalImages: 3,
      imagesResizedCount: "2",
      cacheHitRatio: "66.67%",
      cacheMissRatio: "33.33%",
    };

    const stats = await getServiceUsageStats();

    expect(stats).toEqual(expectedStats);
    expect(fs.readdirSync).toHaveBeenCalledWith(expect.any(String));
    expect(redisClient.get).toHaveBeenCalledWith("imagesResizedCount");
    expect(redisClient.get).toHaveBeenCalledWith("cacheHits");
    expect(redisClient.get).toHaveBeenCalledWith("cacheMisses");
  });
});

describe("getServiceUsageStats with edge cases", () => {
  it("handles missing Redis data correctly", async () => {
    const mockFiles = ["image1.jpg", "image2.jpg"];
    (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);

    (redisClient.get as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const stats = await getServiceUsageStats();

    expect(stats).toEqual({
      totalOriginalImages: 2,
      imagesResizedCount: "0",
      cacheHitRatio: "0.00%",
      cacheMissRatio: "0.00%",
    });
  });
});

describe("getServiceResponseStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("correctly calculates service response statistics", async () => {
    (redisClient.get as jest.Mock)
      .mockResolvedValueOnce("5.25")
      .mockResolvedValueOnce("200")
      .mockResolvedValueOnce("50");

    const stats = await getServiceResponseStats();

    expect(stats).toEqual({
      averageResponseTime: "5.25 ms",
      successfulResponses: "200",
      errorResponses: "50",
      totalResponses: 250,
      errorRate: "20.00%",
    });
  });
});

describe("getServiceResponseStats with edge cases", () => {
  it("handles no responses correctly", async () => {
    (redisClient.get as jest.Mock)
      .mockResolvedValueOnce("0")
      .mockResolvedValueOnce("0")
      .mockResolvedValueOnce("0");

    const stats = await getServiceResponseStats();

    expect(stats).toEqual({
      averageResponseTime: "0.00 ms",
      successfulResponses: "0",
      errorResponses: "0",
      totalResponses: 0,
      errorRate: "0.00%",
    });
  });

  it("calculates 100% error rate correctly", async () => {
    (redisClient.get as jest.Mock)
      .mockResolvedValueOnce("10.5")
      .mockResolvedValueOnce("0")
      .mockResolvedValueOnce("100");

    const stats = await getServiceResponseStats();

    expect(stats).toEqual({
      averageResponseTime: "10.50 ms",
      successfulResponses: "0",
      errorResponses: "100",
      totalResponses: 100,
      errorRate: "100.00%",
    });
  });
});
