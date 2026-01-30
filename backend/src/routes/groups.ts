import { Router } from "express";
import { Group } from "../models/Group.js";
import { GroupExpense } from "../models/GroupExpense.js";
import { User } from "../models/User.js";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = Router();
router.use(requireAuth);

// Create group with members (emails or free-form names)
const createGroupSchema = z.object({
  name: z.string().min(1),
  participants: z
    .array(
      z.object({
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
      })
    )
    .min(1),
});

router.post("/", async (req: AuthRequest, res) => {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { name, participants } = parsed.data;

  // Resolve participants to actual users when email exists; otherwise keep them as free-form names
  const memberIds: mongoose.Types.ObjectId[] = [];
  const memberDisplayNames: string[] = [];

  for (const p of participants) {
    if (p.email) {
      const user = await User.findOne({ email: p.email });
      if (user) {
        memberIds.push(user._id as mongoose.Types.ObjectId);
        memberDisplayNames.push(user.name);
        continue;
      }
    }
    // Fall back to name-only if no account found by email
    if (p.name) {
      memberDisplayNames.push(p.name);
    }
  }

  if (memberIds.length === 0 && memberDisplayNames.length === 0) {
    return res.status(400).json({ error: "At least one valid participant is required" });
  }

  const group = await Group.create({
    name,
    members: memberIds,
  });

  await group.populate("members");

  res.json({
    group,
    meta: {
      memberDisplayNames,
    },
  });
});

// Add members to an existing group
const addMembersSchema = z.object({
  participants: z
    .array(
      z.object({
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
      })
    )
    .min(1),
});

router.post("/:id/members", async (req: AuthRequest, res) => {
  const groupId = req.params.id;
  const parsed = addMembersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const { participants } = parsed.data;

  const currentMemberIds = new Set(group.members.map((m) => m.toString()));
  const newMemberIds: mongoose.Types.ObjectId[] = [];
  const addedDisplayNames: string[] = [];

  for (const p of participants) {
    if (p.email) {
      const user = await User.findOne({ email: p.email });
      if (user && !currentMemberIds.has(user._id.toString())) {
        newMemberIds.push(user._id as mongoose.Types.ObjectId);
        addedDisplayNames.push(user.name);
        continue;
      }
    }
    if (p.name) {
      // purely name-based "guest" participant, tracked only on frontend for now
      addedDisplayNames.push(p.name);
    }
  }

  if (newMemberIds.length > 0) {
    group.members.push(...newMemberIds);
    await group.save();
  }

  await group.populate("members");

  res.json({
    group,
    meta: {
      addedDisplayNames,
    },
  });
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


// Delete shared expense
// Delete group expense (SAME pattern as normal expense)
router.delete("/expenses/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;

  const exp = await GroupExpense.findById(id);
  if (!exp || exp.payerId.toString() !== req.userId)
    return res.status(404).json({ error: "Not found" });

  await GroupExpense.findByIdAndDelete(id);
  res.json({ ok: true });
});



export default router;



