const express = require("express");
const Redis = require("redis");

const app = express();
const redisClient = Redis.createClient();
/* { url: "redis://127.0.0.1:6379" }); for prod we need to send prod redis url in argument. */

const DEFAULT_EXPIRATION = 10; // 10 sec expiration time

app.use(express.json());

(async () => {
  await redisClient.connect();
})();
redisClient.on("connect", () => console.log("Redis Client Connected!"));
redisClient.on("error", (err) => console.log("Redis Client Error!", err));

app.get("/set", async (req, res) => {
  await redisClient.set(req.query.key, req.query.value);
  res.send(`Added ${req.query.key} to redis server`);
});

app.get("/get", async (req, res) => {
  const value = await redisClient.get(req.query.key);
  res.send({ value });
});

app.get("/setex", async (req, res) => {
  const expire = req.query.expire ? req.query.expire : DEFAULT_EXPIRATION;
  await redisClient.set(req.query.key, req.query.value, {
    EX: expire,
  });
  res.send(`Added ${req.query.key} to redis server for ${expire} sec`);
});

app.get("/del", async (req, res) => {
  await redisClient.del(req.query.key);
  res.send();
});

app.get("/flushall", async (req, res) => {
  await redisClient.flushAll("ASYNC");
  res.send();
});

app.get("/keys", async (req, res) => {
  const keys = await redisClient.keys("*");
  res.send(keys);
});

app.get("/ttl", async (req, res) => {
  const value = await redisClient.ttl(req.query.key);
  res.send({ ttl: value });
});

app.listen(3000, () => {
  console.log("Redis server is running on port 3000");
});
