import {
  processImage,
  updateHttpErrorRates,
  updateResponseTimeMetric,
} from "../src/services/image.service";
import sharp from "sharp";
import redisClient from "../src/redis-client";

jest.mock("sharp", () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from("mockImage", "utf-8")),
  }));
});

const mockedSharp = sharp as jest.MockedFunction<typeof sharp>;

jest.mock("../src/redis-client", () => {
  return {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
  };
});

jest.spyOn(process, "hrtime").mockImplementation(() => {
  return [0, 1e7];
});

describe("processImage", () => {
  const mockPath = "path/to/image.jpg";
  const mockResolution = "800x600";
  const mockCacheKey = `image:image.jpg:res:${mockResolution}`;
  const mockImageBuffer = Buffer.from("mockImage", "utf-8");
  const mockBase64Image = mockImageBuffer.toString("base64");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("serves image from cache if available", async () => {
    (redisClient.get as jest.Mock).mockResolvedValueOnce(mockBase64Image);

    const result = await processImage(mockPath, mockResolution);

    expect(redisClient.get).toHaveBeenCalledWith(mockCacheKey);
    expect(result).toEqual(mockImageBuffer);
    expect(redisClient.incr).toHaveBeenCalledWith("cacheHits");
  });

  it("processes and caches the image if not available in cache", async () => {
    (redisClient.get as jest.Mock).mockResolvedValueOnce(null);
    (mockedSharp as unknown as jest.Mock).mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
    });

    const result = await processImage(mockPath, mockResolution);

    expect(redisClient.get).toHaveBeenCalledWith(mockCacheKey);
    expect(mockedSharp).toHaveBeenCalledWith(mockPath);
    expect(mockedSharp().resize).toHaveBeenCalledWith(800, 600);
    expect(result).toEqual(mockImageBuffer);
    expect(redisClient.set).toHaveBeenCalledWith(
      mockCacheKey,
      mockBase64Image,
      { EX: 3600 }
    );
    expect(redisClient.incr).toHaveBeenCalledWith("cacheMisses");
    expect(redisClient.incr).toHaveBeenCalledWith("imagesResizedCount");
  });

  it('does not resize image if resolution is "original"', async () => {
    const originalResolution = "original";
    (redisClient.get as jest.Mock).mockResolvedValueOnce(null);

    await processImage(mockPath, originalResolution);

    expect(mockedSharp).toHaveBeenCalledWith(mockPath);
    expect(mockedSharp().resize).not.toHaveBeenCalled();
  });
});

describe("updateHttpErrorRates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("increments successfulResponses for successful status codes", async () => {
    await updateHttpErrorRates(200);
    expect(redisClient.incr).toHaveBeenCalledWith("successfulResponses");

    jest.clearAllMocks();

    await updateHttpErrorRates(399);
    expect(redisClient.incr).toHaveBeenCalledWith("successfulResponses");
  });

  it("increments errorResponses for error status codes", async () => {
    await updateHttpErrorRates(400);
    expect(redisClient.incr).toHaveBeenCalledWith("errorResponses");

    jest.clearAllMocks();

    await updateHttpErrorRates(500);
    expect(redisClient.incr).toHaveBeenCalledWith("errorResponses");
  });

  it("does not increment counters for status codes < 200", async () => {
    await updateHttpErrorRates(199);
    expect(redisClient.incr).not.toHaveBeenCalled();
  });
});

describe("updateResponseTimeMetric", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates the average response time metric", async () => {
    (redisClient.get as jest.Mock).mockResolvedValueOnce("5");
    (redisClient.incr as jest.Mock).mockResolvedValueOnce(2);

    await updateResponseTimeMetric([0, 0]);

    expect(redisClient.get).toHaveBeenCalledWith("averageResponseTime");
    expect(redisClient.incr).toHaveBeenCalledWith("responseCount");
    expect(redisClient.set).toHaveBeenCalledTimes(1);
    expect(redisClient.set).toHaveBeenCalledWith("averageResponseTime", "7.5");
  });

  it("handles initial calculation when no average is present", async () => {
    (redisClient.get as jest.Mock).mockResolvedValueOnce(null);
    (redisClient.incr as jest.Mock).mockResolvedValueOnce(1);

    await updateResponseTimeMetric([0, 0]);

    expect(redisClient.set).toHaveBeenCalledWith("averageResponseTime", "10");
  });
});
