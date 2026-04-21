import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function testUserCreation() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("Creating test user...");
    const testUser = await User.create({
      email: "testuser123456789@example.com",
      fullName: "Test User",
      password: "password123"
    });

    console.log("User created successfully:", testUser);
    console.log("User ID:", testUser._id);
    console.log("Email:", testUser.email);

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    console.log("Test user deleted");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

  } catch (error) {
    console.error("Error:", error);
  }
}

testUserCreation();