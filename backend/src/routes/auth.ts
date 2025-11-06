import { Router } from "express";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth, signToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already in use" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken(user._id.toString());
  return res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email } });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken(user._id.toString());
  return res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email } });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId!).select("name email");
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
});

export default router;



