import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import destinations from "./routes/destinations.js";
import packages from "./routes/packages.js";
import reviews from "./routes/reviews.js";
import leads from "./routes/leads.js";
import auth from "./routes/auth.js";
import uploads from "./routes/uploads.js";
import stays from "./routes/stays.js";
import policies from "./routes/policies.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN.split(","), credentials: false }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads"), {
  maxAge: "30d",
}));

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use("/api/auth", auth);
app.use("/api/destinations", destinations);
app.use("/api/packages", packages);
app.use("/api/reviews", reviews);
app.use("/api/leads", leads);
app.use("/api/uploads", uploads);
app.use("/api/stays", stays);
app.use("/api/policies", policies);

// Serve frontend built static assets
const FRONTEND_DIST = path.resolve(__dirname, "..", "public");
app.use(express.static(FRONTEND_DIST));

// Handle client-side routing by serving index.html for non-API routes
app.get("/*splat", (req, res, next) => {
  // Pass API requests that don't match any endpoints to the error handler or 404
  if (req.path.startsWith("/api/")) {
    return next();
  }
  const indexPath = path.join(FRONTEND_DIST, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend build not found. Please run 'npm run build' in pinkfoot-app.");
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal error" });
});

app.listen(PORT, () => {
  console.log(`✓ Pinkfoot API running at http://localhost:${PORT}`);
  console.log(`  Admin login: ${process.env.ADMIN_EMAIL || "info@pinkfoottravel.com"} / ${process.env.ADMIN_PASSWORD || "Admin@Pinkfoot123"}`);
});
