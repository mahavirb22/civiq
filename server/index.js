import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import chatRouter from "./routes/chat.js";
import mapsRouter from "./routes/maps.js";
import ttsRouter from "./routes/tts.js";
import searchRouter from "./routes/search.js";
import quizRouter from "./routes/quiz.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.options(/.*/, cors());
app.use(express.json());

// Advanced Security & Efficiency Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com", "https://electoralsearch.eci.gov.in"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://maps.googleapis.com"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));
app.use(compression());

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/", apiLimiter);

// API Routes
app.use("/api/chat", chatRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/tts", ttsRouter);
app.use("/api/search", searchRouter);
app.use("/api/quiz", quizRouter);

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, "../dist")));

// Fallback for SPA routing — MUST be last
app.use((req, res) => {
  if (req.url.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`>>> Civiq Server is now live on port ${PORT}`);
  console.log(`>>> Health check: http://localhost:${PORT}/api/chat/health`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌  Port ${PORT} is already in use.`);
    console.error(`   → Run this to free it:  npx kill-port ${PORT}`);
    console.error(`   → Or use:               taskkill /F /IM node.exe`);
    console.error(`   Then restart the server.\n`);
  } else {
    console.error(">>> Server failed to start:", error);
  }
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n>>> Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log(">>> Server closed.");
    process.exit(0);
  });
  // Force exit if close takes too long
  setTimeout(() => process.exit(1), 5000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
