const express = require("express");
const cors = require("cors");
const keys = require("./keys");
const bodyParser = require("body-parser");

// Express app setup

const app = express();
// allows request between posrts
app.use(cors());
//
app.use(bodyParser.json());

// Postgress client setup

const { Pool } = require("pg");

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("error", () => {
  console.log("Lost postgress connection");
});

pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch((err) => console.log(err));

// Redis client setup

const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});
app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) return res.status(422).send("Index too high");

  redisClient.hset("values", index, "Nothing yet");
  // this is for the worker to calculate a new value and save it in redis
  redisPublisher.publish("insert", index);

  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
  res.send({ working: true });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
