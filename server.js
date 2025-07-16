require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/fights", async (req, res) => {
  const fights = await pool.query("SELECT * FROM fights ORDER BY id");
  res.json(fights.rows);
});

app.get("/api/picks/:username", async (req, res) => {
  const { username } = req.params;
  const result = await pool.query("SELECT * FROM picks WHERE username = $1", [username]);
  res.json(result.rows[0]?.picks || {});
});

app.post("/api/picks", async (req, res) => {
  const { username, picks } = req.body;
  await pool.query(`
    INSERT INTO picks (username, picks)
    VALUES ($1, $2)
    ON CONFLICT (username) DO UPDATE SET picks = $2
  `, [username, picks]);
  res.json({ success: true });
});

app.get("/api/leaderboard", async (req, res) => {
  const result = await pool.query("SELECT username, score FROM picks ORDER BY score DESC");
  res.json(result.rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
