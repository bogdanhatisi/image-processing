import express from "express";
import imageRoutes from "./routes/imageRoutes"; // Adjust the path as necessary

const app = express();
const port = process.env.PORT || 3000;

app.use("/images", imageRoutes);

app.get("/", (req, res) => {
  res.send("Image Processing Service is running");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
