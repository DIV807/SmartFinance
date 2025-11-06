import { Router } from "express";
import { Expense } from "../models/Expense.js";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const expenses = await Expense.find({ userId: new mongoose.Types.ObjectId(req.userId!) }).sort({ createdAt: -1 });
  res.json({ expenses });
});

const createSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().min(1),
  date: z.string().transform((s) => new Date(s)),
});

router.post("/", async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { amount, category, description, date } = parsed.data;
  const created = await Expense.create({
    userId: new mongoose.Types.ObjectId(req.userId!),
    amount,
    category,
    description,
    date,
  });
  res.json({ expense: created });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const exp = await Expense.findById(id);
  if (!exp || exp.userId.toString() !== req.userId) return res.status(404).json({ error: "Not found" });
  await Expense.findByIdAndDelete(id);
  res.json({ ok: true });
});

export default router;



