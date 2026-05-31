import express from "express";
import path from "path";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// The Resume AI Platform URL for secure back-to-back administrative requests
const RESUME_AI_URL = process.env.RESUME_AI_API_URL || "http://localhost:3000";
const ADMIN_SECRET = "Kwork.com";

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "alive", component: "admin-panel", timestamp: new Date().toISOString() });
  return;
});

// Proxy GET payments
app.get("/api/payments", async (req, res) => {
  try {
    const password = req.headers["x-admin-password"] || req.query.password;
    if (password !== ADMIN_SECRET) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    const response = await fetch(`${RESUME_AI_URL}/api/payments?password=${ADMIN_SECRET}`, {
      headers: {
        "X-Admin-Password": ADMIN_SECRET
      }
    });

    if (!response.ok) {
      res.status(response.status).send(await response.text());
      return;
    }

    const data = await response.json();
    res.json(data);
    return;
  } catch (err: any) {
    res.status(500).json({ error: "Failed to connect to Resume AI Core Platform: " + err.message });
    return;
  }
});

// Proxy POST payment action
app.post("/api/payments/action", async (req, res) => {
  try {
    const password = req.headers["x-admin-password"] || req.body.password;
    if (password !== ADMIN_SECRET) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    const response = await fetch(`${RESUME_AI_URL}/api/payments/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Password": ADMIN_SECRET
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      res.status(response.status).send(await response.text());
      return;
    }

    const data = await response.json();
    res.json(data);
    return;
  } catch (err: any) {
    res.status(500).json({ error: "Failed to write approval to Resume AI Core Platform: " + err.message });
    return;
  }
});

// Proxy POST database clear
app.post("/api/payments/clear", async (req, res) => {
  try {
    const password = req.headers["x-admin-password"];
    if (password !== ADMIN_SECRET) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    const response = await fetch(`${RESUME_AI_URL}/api/payments/clear`, {
      method: "POST",
      headers: {
        "X-Admin-Password": ADMIN_SECRET
      }
    });

    if (!response.ok) {
      res.status(response.status).send(await response.text());
      return;
    }

    res.json({ success: true });
    return;
  } catch (err: any) {
    res.status(500).json({ error: "Failed to clear Resume AI Core database: " + err.message });
    return;
  }
});

// Mount Vite or serve production bundle
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
    return;
  });
}

const servePort = process.env.PORT || 3001;
app.listen(Number(servePort), "0.0.0.0", () => {
  console.log(`[Admin Server] Standalone Admin Panel running on http://localhost:${servePort}`);
});
