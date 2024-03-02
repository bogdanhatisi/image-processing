import express from "express";
import imageRoutes from "./routes/image.routes";
import serviceUsageRoutes from "./routes/service-usage.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use("/images", imageRoutes);
app.use("/stats", serviceUsageRoutes);

app.get("/", (req, res) => {
  res.send("Image Processing Service is running");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
