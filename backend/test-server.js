import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import User from "./src/models/User.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5002; // Different port to avoid conflicts

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Simple signup endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    console.log("Signup request:", { email, fullName });

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create user
    const newUser = await User.create({
      email,
      fullName,
      password,
    });

    console.log("User created:", newUser._id);

    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});