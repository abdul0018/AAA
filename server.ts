import express from "express";
import path from "path";
import fs from "fs";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const TELEGRAM_TOKEN = "8539634953:AAFtSSC4r_pyYApe_rPAuORe4A-5jsTKq6k";
const MINI_APP_URL = "https://rr-ebon-six.vercel.app/";

let botUsername = "resyume_ai_bot";

function getMiniAppUrl(): string {
  if (process.env.PRODUCTION_URL) {
    return process.env.PRODUCTION_URL.endsWith("/") ? process.env.PRODUCTION_URL : process.env.PRODUCTION_URL + "/";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/`;
  }
  return MINI_APP_URL;
}

// File storage path for persistent payments database
const PAYMENTS_FILE = path.join(process.cwd(), "payments.json");

// Helper to read database
function readPayments(): any[] {
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading payments.json:", err);
  }
  return [];
}

// Helper to write database
function writePayments(payments: any[]) {
  try {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing payments.json:", err);
  }
}

export const app = express();

// Set generous payload limits to support base64 image uploads for payment checks
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoint for Railway, Render, etc.
  app.get("/health", (_req, res) => {
    return res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
  });

  // API Route: Bot info for the frontend
  app.get("/api/bot-info", (_req, res) => {
    return res.json({
      username: botUsername,
      appUrl: getMiniAppUrl()
    });
  });

  // GET all payments (Admin authentication required)
  app.get("/api/payments", (req, res) => {
    const password = req.headers["x-admin-password"] || req.query.password;
    if (password !== "Kwork.com") {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const payments = readPayments();
    return res.json(payments);
  });

  // GET specific user's payment status
  app.get("/api/payments/status/:userId", (req, res) => {
    const { userId } = req.params;
    const payments = readPayments();
    const request = payments.find(p => p.userId === userId);
    if (request) {
      return res.json(request);
    } else {
      return res.status(404).json({ error: "No payment request found for this userId" });
    }
  });

  // POST new payment request or update existing
  app.post("/api/payments", (req, res) => {
    const { id, userId, fullName, phoneNumber, screenshot, status, timestamp } = req.body;
    if (!userId || !fullName || !phoneNumber || !screenshot) {
      return res.status(400).json({ error: "userId, fullName, phoneNumber and screenshot are required fields" });
    }

    const payments = readPayments();
    const index = payments.findIndex(p => p.userId === userId);

    const paymentReq = {
      id: id || "req_" + Math.random().toString(36).substring(2, 11),
      userId,
      fullName,
      phoneNumber,
      screenshot,
      status: status || "pending",
      timestamp: timestamp || new Date().toLocaleString()
    };

    if (index !== -1) {
      // Keep approved status stable if user is resubmitting by accident? 
      // Usually they upload if not approved. Let's overwrite so they can re-request if rejected.
      payments[index] = paymentReq;
    } else {
      payments.unshift(paymentReq);
    }

    writePayments(payments);
    return res.json({ success: true, payment: paymentReq });
  });

  // POST admin verification update
  app.post("/api/payments/action", (req, res) => {
    const password = req.headers["x-admin-password"] || req.body.password;
    if (password !== "Kwork.com") {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "id and status are required fields" });
    }

    const payments = readPayments();
    const index = payments.findIndex(p => p.id === id);

    if (index !== -1) {
      payments[index].status = status;
      writePayments(payments);
      return res.json({ success: true, payment: payments[index] });
    } else {
      return res.status(404).json({ error: "Payment request not found" });
    }
  });

  // POST clear/reset persistent database
  app.post("/api/payments/clear", (req, res) => {
    const password = req.headers["x-admin-password"];
    if (password !== "Kwork.com") {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    writePayments([]);
    return res.json({ success: true });
  });

  // POST telegram-webhook handler for serverless / webhook environments
  app.post("/api/telegram-webhook", async (req, res) => {
    try {
      const update = req.body;
      if (update && update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();
        const fromUser = update.message.from;
        
        if (text.startsWith("/start")) {
          const userName = fromUser?.first_name || "do'st";
          const welcomeMessage = `👋 Assalomu alaykum, ${userName}!\n\nRezyume AI ga xush kelibsiz!\n\nBir necha daqiqa ichida o‘zbek, rus yoki ingliz tilida zamonaviy va professional rezyume yarating.\n\nBoshlash uchun quyidagi tugmani bosing. 🚀`;
          const buttonText = "Boshlash 🚀";
          const currentAppUrl = getMiniAppUrl();
          
          const inlineKeyboard = {
            inline_keyboard: [
              [
                {
                  text: buttonText,
                  web_app: {
                    url: currentAppUrl
                  }
                }
              ]
            ]
          };
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: welcomeMessage,
              reply_markup: inlineKeyboard
            })
          });
        }
      }
    } catch (err) {
      console.error("Error in telegram webhook:", err);
    }
    // Always return 200 OK right away to prevent Telegram retrying
    return res.status(200).json({ ok: true });
  });

  async function startServer() {
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const { createServer: createViteServer } = await import("vite");
      const viteAdmin = await createViteServer({
        configFile: path.join(process.cwd(), "admin", "vite.config.ts"),
        root: path.join(process.cwd(), "admin"),
        server: { middlewareMode: true, hmr: false },
        appType: "spa",
      });
      app.use("/admin", viteAdmin.middlewares);

      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else if (!process.env.VERCEL) {
      const distAdminPath = path.join(process.cwd(), "dist", "admin");
      app.use("/admin", express.static(distAdminPath));
      app.get("/admin*", (_req, res) => {
        if (fs.existsSync(path.join(distAdminPath, "index.html"))) {
          res.sendFile(path.join(distAdminPath, "index.html"));
        } else {
          res.status(404).send("Admin panel not found");
        }
      });

      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*all", (_req, res) => {
        if (fs.existsSync(path.join(distPath, "index.html"))) {
          res.sendFile(path.join(distPath, "index.html"));
        } else {
          res.status(404).send("Application not found");
        }
      });
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  }

// Telegram Bot Verification and Setup on startup
async function setupTelegramBot() {
  const currentAppUrl = getMiniAppUrl();

  if (process.env.VERCEL) {
    // Under Vercel, register webhook pointing to our vercel serverless function endpoint
    try {
      const webhookUrl = `${currentAppUrl.replace(/\/$/, "")}/api/telegram-webhook`;
      console.log(`Configuring Telegram Webhook on Vercel: ${webhookUrl}`);
      const setWebhookRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl })
      });
      const data = await setWebhookRes.json() as any;
      console.log("Set Webhook response:", data);
    } catch (err) {
      console.error("Error setting Telegram webhook on Vercel:", err);
    }
  } else {
    try {
      // Clear any existing Webhooks to allow clean getUpdates long polling
      const deleteWebhookRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteWebhook?drop_pending_updates=true`);
      const deleteWebhookData = await deleteWebhookRes.json() as any;
      console.log("Delete Webhook response:", deleteWebhookData);
    } catch (err) {
      console.error("Error clearing existing Telegram webhook:", err);
    }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`);
    if (res.ok) {
      const data = await res.json() as any;
      if (data.ok && data.result) {
        botUsername = data.result.username;
        console.log(`Telegram Bot verified: @${botUsername}`);
      }
    }
  } catch (err) {
    console.error("Error setting up Telegram Bot:", err);
  }

  // Set the chat menu button so they have the permanent bottom-left Open App action in the bot chat
  try {
    const menuButtonRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setChatMenuButton`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu_button: {
          type: "web_app",
          text: "Open Rezyume AI",
          web_app: {
            url: currentAppUrl
          }
        }
      })
    });
    const menuData = await menuButtonRes.json();
    console.log("Menu button setup response:", menuData);
  } catch (err) {
    console.error("Error setting up chat menu button:", err);
  }
}

// High performance, robust long polling service for bot events to handle /start interactions instantly
async function startTelegramPolling() {
  let offset = 0;
  console.log("Starting Telegram Bot long polling...");
  while (true) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=${offset}&timeout=30`);
      
      if (response.status === 409) {
        console.warn("Telegram polling conflict (HTTP 409): Another server instance or environment is currently polling or webhook is active. Backing off for 15 seconds...");
        await new Promise(resolve => setTimeout(resolve, 15000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch updates from Telegram: ${response.status} ${response.statusText}`);
      }
      const data = await response.json() as { ok: boolean, result: any[] };
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text.trim();
            const fromUser = update.message.from;
            const langCode = fromUser?.language_code || "uz";
            
            if (text.startsWith("/start")) {
              const userName = fromUser?.first_name || "do'st";
              const welcomeMessage = `👋 Assalomu alaykum, ${userName}!\n\nRezyume AI ga xush kelibsiz!\n\nBir necha daqiqa ichida o‘zbek, rus yoki ingliz tilida zamonaviy va professional rezyume yarating.\n\nBoshlash uchun quyidagi tugmani bosing. 🚀`;
              const buttonText = "Boshlash 🚀";
              const currentAppUrl = getMiniAppUrl();
              
              const inlineKeyboard = {
                inline_keyboard: [
                  [
                    {
                      text: buttonText,
                      web_app: {
                        url: currentAppUrl
                      }
                    }
                  ]
                ]
              };
              
              await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: welcomeMessage,
                  reply_markup: inlineKeyboard
                })
              });
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error in Telegram polling loop:", error.message || error);
      // Wait 10 seconds before retrying to prevent aggressive loops if network/server issue
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

async function boot() {
  await startServer();
  if (!process.env.VERCEL) {
    await setupTelegramBot();
    // We run polling in background without blocking server boot
    startTelegramPolling();
  } else {
    // On Vercel, run setupTelegramBot in the background so that functions starts instantly
    setupTelegramBot().catch(err => {
      console.error("Delayed Telegram registration failed:", err);
    });
  }
}

boot();

export default app;
