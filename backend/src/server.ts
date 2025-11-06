import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";
import groupRoutes from "./routes/groups.js";

const app = express();
app.use(helmet());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || true, 
  credentials: true 
}));
app.use(express.json({ limit: "2mb" }));

// MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/smartfinance";
mongoose
  .connect(mongoUri)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err);
  });

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/groups", groupRoutes);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ SmartFinance API listening on http://localhost:${port}`);
});



