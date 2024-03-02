// Import statements remain the same
import { Request, Response } from "express";
import * as serviceUsageService from "../src/services/service-usage.service";
import {
  getServiceResponseStatsController,
  getServiceUsageStatsController,
} from "../src/controllers/service-usage.controller";

jest.mock("../src/services/service-usage.service", () => ({
  getServiceResponseStats: jest.fn(),
  getServiceUsageStats: jest.fn(),
}));

describe("getServiceResponseStatsController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };

    (serviceUsageService.getServiceResponseStats as jest.Mock).mockClear();
    mockJson.mockClear();
    mockStatus.mockClear();
    mockSend.mockClear();
  });

  it("should send JSON response with stats on success", async () => {
    const mockStats = { success: true, data: [] };
    (
      serviceUsageService.getServiceResponseStats as jest.Mock
    ).mockResolvedValue(mockStats);

    await getServiceResponseStatsController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockStats);
  });

  it("should send 500 status code on error", async () => {
    (
      serviceUsageService.getServiceResponseStats as jest.Mock
    ).mockRejectedValue(new Error("Test error"));

    await getServiceResponseStatsController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockSend).toHaveBeenCalledWith(
      "Failed to retrieve service response stats"
    );
  });
});

describe("getServiceUsageStatsController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };

    (serviceUsageService.getServiceUsageStats as jest.Mock).mockClear();
    mockJson.mockClear();
    mockStatus.mockClear();
    mockSend.mockClear();
  });

  it("should send JSON response with stats on success", async () => {
    const mockStats = { success: true, data: [] };
    (serviceUsageService.getServiceUsageStats as jest.Mock).mockResolvedValue(
      mockStats
    );

    await getServiceUsageStatsController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockStats);
  });

  it("should send 500 status code on error", async () => {
    const errorMessage = "Failed to retrieve service usage stats";
    (serviceUsageService.getServiceUsageStats as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    await getServiceUsageStatsController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockSend).toHaveBeenCalledWith(errorMessage);
  });
});
