import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.post("/signup", async (req, res) => {
    return res.status(410).json({
        error: "Signup is managed by Clerk. Use Clerk SignUp on the frontend, then call /auth/me with Clerk token.",
    });
});
router.post("/login", async (req, res) => {
    return res.status(410).json({
        error: "Login is managed by Clerk. Use Clerk SignIn on the frontend, then call /auth/me with Clerk token.",
    });
});
router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.userId).select("name email");
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
});
export default router;
