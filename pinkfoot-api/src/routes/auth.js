import { Router } from "express";
import { signAdminToken, requireAdmin } from "../auth.js";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@pinkfoottravel.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@Pinkfoot123";
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signAdminToken(email);
  res.json({ token, email });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ email: req.admin.sub, role: req.admin.role });
});

export default router;
