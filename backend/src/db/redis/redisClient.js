const redis = require("redis");

const redisClient = redis.createClient();

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

module.exports = redisClient;
