import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    clerkId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Kept optional for Clerk-based auth. Legacy local-auth users may still have this value.
    passwordHash: { type: String, required: false },
}, { timestamps: true });
export const User = mongoose.model("User", userSchema);
