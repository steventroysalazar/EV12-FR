import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("sms_gateway.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS command_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name TEXT,
    phone_number TEXT,
    command TEXT,
    raw_message TEXT,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM command_history ORDER BY timestamp DESC LIMIT 50").all();
    res.json(history);
  });

  app.post("/api/send-command", (req, res) => {
    const { deviceName, phoneNumber, command, rawMessage } = req.body;

    if (!phoneNumber || !rawMessage) {
      return res.status(400).json({ error: "Phone number and message are required" });
    }

    // Here you would integrate with an actual SMS Gateway API
    // For now, we simulate success and log to history
    console.log(`Sending SMS to ${phoneNumber}: ${rawMessage}`);

    try {
      const stmt = db.prepare(`
        INSERT INTO command_history (device_name, phone_number, command, raw_message, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(deviceName, phoneNumber, command, rawMessage, "Sent");
      
      res.json({ success: true, message: "Command sent successfully (simulated)" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to log command" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
