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
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// -------------------------------------------------------------
// Vercel Serverless MongoDB Connection Handler (Cached Connection)
// -------------------------------------------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return; // Agar connection pehle se active hai, toh dobara connect mat karo
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Prevents queries from buffering infinitely if connection drops
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    throw new Error("Database connection failed");
  }
};

// Middleware to ensure DB connection before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Routes
app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/admin", adminRoutes);

// Note: Local static files like /uploads do not work on Vercel read-only filesystem.
// Consider Cloudinary/S3 for uploads in production.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is Running Successfully"
  });
});

// Local Development listen block
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
  });
}

// Export app for Vercel
module.exports = app;const path = require("path");
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
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// -------------------------------------------------------------
// Vercel Serverless MongoDB Connection Handler (Cached Connection)
// -------------------------------------------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return; // Agar connection pehle se active hai, toh dobara connect mat karo
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Prevents queries from buffering infinitely if connection drops
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    throw new Error("Database connection failed");
  }
};

// Middleware to ensure DB connection before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Routes
app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/admin", adminRoutes);

// Note: Local static files like /uploads do not work on Vercel read-only filesystem.
// Consider Cloudinary/S3 for uploads in production.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is Running Successfully"
  });
});

// Local Development listen block
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
  });
}

// Export app for Vercel
module.exports = app;