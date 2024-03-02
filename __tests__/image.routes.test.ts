import request from "supertest";
import express from "express";
import router from "../src/routes/image.routes";

jest.mock("../src/middlewares/utils.middleware", () => ({
  trackStartTime: jest.fn((req: any, res: any, next: any) => next()),
  checkImageExists: jest.fn((req: any, res: any, next: any) => {
    const imageName = req.params.imageName;

    if (imageName === "existing-image.jpg") {
      req.imagePath = `/mock/images/directory/${imageName}`;
      next();
    } else {
      res.status(404).send("Image not found");
    }
  }),
}));

jest.mock("../src/controllers/image.controller", () => ({
  processImageRequestController: (req: any, res: any, next: any) =>
    res.sendStatus(200),
}));

const app = express();
app.use(express.json());
app.use(router);

describe("GET /:imageName", () => {
  it("should process image request successfully", async () => {
    const response = await request(app).get("/existing-image.jpg");
    expect(response.statusCode).toBe(200);
  });

  it("should return 404 image not found", async () => {
    const response = await request(app).get("/missing-image.jpg");
    expect(response.statusCode).toBe(404);
  });
});
