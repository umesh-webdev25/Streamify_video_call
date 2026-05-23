import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import meetingRoutes from "./routes/meeting.routes.js";
import sessionRoutes from "./routes/session.route.js";
import groupRouter from "./routes/group.routes.js";
import contectRouter from "./routes/contact.routes.js";
import scheduleMeetingRoutes from "./routes/scheduleMeeting.route.js";
import { connectDB } from "./lib/db.js";
import errorMiddleware from "./middleware/error.middleware.js";
import AppError from "./utils/AppError.js";

// Load .env before using process.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// 1. GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// 2. ROUTES
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/groups", groupRouter);
app.use("/api/contacts", contectRouter);
app.use("/api/schedule-meetings", scheduleMeetingRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLER
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
import jwt from "jsonwebtoken";
import Group from "./models/group.js";

const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(";").reduce((acc, cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      acc[parts[0].trim()] = parts.slice(1).join("=");
    }
    return acc;
  }, {});
};

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected via Socket.IO:", socket.id);
  
  socket.on("join_group_room", async (groupId) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.jwt;
      if (!token) {
        console.log(`Unauthorized room join attempt: No token for socket ${socket.id}`);
        return;
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (!decoded || !decoded.userId) {
        console.log(`Unauthorized room join attempt: Invalid token for socket ${socket.id}`);
        return;
      }

      const group = await Group.findById(groupId);
      if (!group || group.isDeleted) {
        console.log(`Room join failed: Group ${groupId} not found or deleted`);
        return;
      }

      const isMember = group.members.some(
        (m) => m.user.toString() === decoded.userId.toString()
      );

      if (isMember) {
        socket.join(`group:${groupId}`);
        console.log(`Socket ${socket.id} (user: ${decoded.userId}) joined room group:${groupId}`);
      } else {
        console.log(`Unauthorized room join: User ${decoded.userId} not a member of group ${groupId}`);
      }
    } catch (e) {
      console.error("Socket room join authorization failed:", e.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});
