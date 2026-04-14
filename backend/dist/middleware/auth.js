import { verifyToken } from "@clerk/backend";
import { User } from "../models/User.js";
export async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token)
        return res.status(401).json({ error: "Missing token" });
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
        return res.status(500).json({ error: "CLERK_SECRET_KEY is not configured" });
    }
    try {
        const payload = await verifyToken(token, { secretKey: clerkSecretKey });
        const clerkUserId = payload.sub;
        const email = typeof payload.email === "string" ? payload.email : undefined;
        const fullName = typeof payload.name === "string" ? payload.name : undefined;
        if (!clerkUserId) {
            return res.status(401).json({ error: "Invalid token payload" });
        }
        if (!email) {
            return res.status(401).json({ error: "Email claim missing in Clerk token" });
        }
        // Keep Mongo user IDs as app-level IDs for existing expenses/groups relations.
        let user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                user.clerkId = clerkUserId;
                if (fullName && !user.name)
                    user.name = fullName;
                await user.save();
            }
            else {
                user = await User.create({
                    clerkId: clerkUserId,
                    email,
                    name: fullName || email.split("@")[0] || "User",
                });
            }
        }
        req.userId = user._id.toString();
        req.clerkUserId = clerkUserId;
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
