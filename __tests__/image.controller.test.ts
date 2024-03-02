import { processImageRequestController } from "../src/controllers/image.controller";
import { RequestWithImagePath } from "../src/models/request.model";
import { Response } from "express";
import * as imageService from "../src/services/image.service";

jest.mock("../src/services/image.service", () => ({
  processImage: jest.fn(),
  updateHttpErrorRates: jest.fn(),
  updateResponseTimeMetric: jest.fn(),
}));

jest.mock("path", () => ({
  ...jest.requireActual("path"),
  extname: jest.fn().mockReturnValue(".jpg"),
}));

describe("processImageRequestController", () => {
  const mockSend = jest.fn();
  const mockStatus = jest.fn().mockReturnThis();
  const mockType = jest.fn().mockReturnThis();
  const mockOn = jest.fn();
  const mockRemoveListener = jest.fn();

  const mockRes: Partial<Response> = {
    send: mockSend,
    status: mockStatus,
    type: mockType,
    on: mockOn,
    removeListener: mockRemoveListener,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully processes an image request", async () => {
    const mockReq: Partial<RequestWithImagePath> = {
      query: { resolution: "1024x768" },
      imagePath: "/path/to/image.jpg",
    };

    (imageService.processImage as jest.Mock).mockResolvedValue("imageBuffer");

    await processImageRequestController(
      mockReq as RequestWithImagePath,
      mockRes as Response
    );

    expect(imageService.processImage).toHaveBeenCalledWith(
      "/path/to/image.jpg",
      "1024x768"
    );
    expect(mockType).toHaveBeenCalledWith("image/jpg");
    expect(mockSend).toHaveBeenCalledWith("imageBuffer");
    expect(imageService.updateHttpErrorRates).toHaveBeenCalledWith(200);
  });

  it("handles error when image path is not found", async () => {
    const mockReq: Partial<RequestWithImagePath> = {
      query: {},
      imagePath: undefined,
    };

    await processImageRequestController(
      mockReq as RequestWithImagePath,
      mockRes as Response
    );

    expect(imageService.updateHttpErrorRates).toHaveBeenCalledWith(500);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockSend).toHaveBeenCalledWith("Failed to process image");
  });
});
