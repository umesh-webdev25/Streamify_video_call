import express from "express";
import dotenv from "dotenv";   // ✅ import dotenv
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
import { isStreamInitialized } from "./lib/stream.js";

// Load .env before using process.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

console.log("DEBUG ENV:");
console.log("PORT =", process.env.PORT);
console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("STREAM_API_KEY =", process.env.STREAM_API_KEY);
console.log("STREAM_API_SECRET =", process.env.STREAM_API_SECRET);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});

// Simple debug endpoint to check service initializations
app.get("/api/debug", (req, res) => {
  const debug = {
    mongoUriPresent: !!process.env.MONGO_URI,
    streamApiKeyPresent: !!process.env.STREAM_API_KEY,
    streamApiSecretPresent: !!process.env.STREAM_API_SECRET,
    streamInitialized: isStreamInitialized(),
    jwtSecretPresent: !!process.env.JWT_SECRET_KEY,
    frontendUrl: FRONTEND_URL,
  };

  res.status(200).json(debug);
});
