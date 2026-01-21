import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";
import groupRoutes from "./routes/groups.js";

const app = express();

// Configure Helmet to allow cross-origin requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - allow all origins in development, specific origin in production
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : process.env.CORS_ORIGIN 
    ? [process.env.CORS_ORIGIN]
    : true;

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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



