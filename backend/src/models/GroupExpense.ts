import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  share: { type: Number, required: true }, // amount owed
});

const groupExpenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    payerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    category: { type: String },
    description: { type: String, required: true },
    splits: [splitSchema],
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const GroupExpense = mongoose.model("GroupExpense", groupExpenseSchema);











