import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://redis:6379", // Update this URL based on your Redis configuration
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
