const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database("team.db");

app.use(express.json());
app.use(express.static(__dirname));

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        available INTEGER NOT NULL DEFAULT 0
    )
`);

const count = db.prepare("SELECT COUNT(*) AS total FROM users").get();

if (count.total === 0) {
  const insert = db.prepare(
    "INSERT INTO users (name, available) VALUES (?, ?)",
  );

  insert.run("Nithya Shetty", 1);
  insert.run("Rahul Sharma", 0);
  insert.run("Priya Kumar", 1);
  insert.run("Arjun Rao", 0);
}

app.get("/api/users", (req, res) => {
  const users = db
    .prepare("SELECT id, name, available FROM users ORDER BY id")
    .all();

  res.json(
    users.map((user) => ({
      ...user,
      available: Boolean(user.available),
    })),
  );
});

app.patch("/api/users/:id/availability", (req, res) => {
  const { available } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || ![true, false].includes(available)) {
    return res.status(400).json({
      error: "Invalid user ID or availability value",
    });
  }

  const result = db
    .prepare("UPDATE users SET available = ? WHERE id = ?")
    .run(available ? 1 : 0, id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.json({
    message: "Availability updated",
    id,
    available,
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
