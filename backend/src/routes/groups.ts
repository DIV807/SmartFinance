import { Router } from "express";
import { Group } from "../models/Group.js";
import { GroupExpense } from "../models/GroupExpense.js";
import { User } from "../models/User.js";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = Router();
router.use(requireAuth);

// Create group with members (userIds)
const createGroupSchema = z.object({ name: z.string().min(1), members: z.array(z.string().min(1)).min(2) });
router.post("/", async (req: AuthRequest, res) => {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, members } = parsed.data;
  // Convert member IDs to ObjectIds
  const memberIds = members.map((id) => new mongoose.Types.ObjectId(id));
  const group = await Group.create({ name, members: memberIds });
  await group.populate("members");
  res.json({ group });
});

// Add shared expense to group
const addExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string().transform((s) => new Date(s)),
  payerId: z.string(),
  participantIds: z.array(z.string()).min(1),
  category: z.string().optional(),
});
router.post("/:id/expenses", async (req: AuthRequest, res) => {
  const groupId = req.params.id;
  const parsed = addExpenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { amount, description, date, payerId, participantIds, category } = parsed.data;
  const share = amount / participantIds.length;
  const splits = participantIds.map((userId) => ({
    userId: new mongoose.Types.ObjectId(userId),
    share,
  }));
  const created = await GroupExpense.create({
    groupId: new mongoose.Types.ObjectId(groupId),
    payerId: new mongoose.Types.ObjectId(payerId),
    amount,
    description,
    date,
    category: category || "Others",
    splits,
  });
  await created.populate("payerId");
  res.json({ expense: created });
});

// Compute balances
router.get("/:id/balances", async (req: AuthRequest, res) => {
  const groupId = req.params.id;
  const group = await Group.findById(groupId).populate("members");
  if (!group) return res.status(404).json({ error: "Not found" });
  const expenses = await GroupExpense.find({ groupId }).populate("splits.userId");
  const balances: Record<string, number> = {};
  group.members.forEach((m) => {
    balances[m._id.toString()] = 0;
  });
  for (const e of expenses) {
    const payerId = e.payerId.toString();
    balances[payerId] += e.amount;
    for (const split of e.splits) {
      const userId = split.userId.toString();
      balances[userId] -= split.share;
    }
  }
  // Map to user names for convenience
  const byUser: Record<string, number> = {};
  for (const [userId, balance] of Object.entries(balances)) {
    const user = await User.findById(userId);
    if (user) {
      byUser[user.name] = Math.round(balance);
    }
  }
  res.json({ balances: byUser });
});

export default router;



