const path = require("path");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// CORS Setup
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// -------------------------------------------------------------
// Vercel Serverless MongoDB Connection Handler (Cached Connection)
// -------------------------------------------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return; // Active connection reuse karein
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Prevents queries buffering indefinitely
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    throw new Error("Database connection failed");
  }
};

// Middleware to ensure DB connection before handling requests (Required for Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// API Routes
app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/admin", adminRoutes);

// Health Check Endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is Running Successfully",
  });
});

// Local Development listen block
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  
  // Server listen karne se pehle local DB connect trigger karein
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running On Port ${PORT}`);
    });
  }).catch((err) => {
    console.error("Failed to start server due to DB connection error:", err);
  });
}

// Export app for Vercel Serverless Functions
module.exports = app;