    require("dotenv").config();

    const express = require("express");
    const mongoose = require("mongoose");
    const bcrypt = require("bcryptjs");
    const cors = require("cors");

    const User = require("./models/User");
    const authRoutes = require("./routes/authRoutes");
    const postRoutes = require("./routes/postRoutes");
    const commentRoutes = require("./routes/commentRoutes");
    const adminRoutes = require("./routes/adminRoutes");

    const app = express();
    const path = require("path");

    app.use(cors());
    app.use(express.json());

    app.use("/auth", authRoutes);
    app.use("/posts", postRoutes);
    app.use("/comments", commentRoutes);
    app.use("/admin", adminRoutes);
    app.use("/uploads",express.static(path.join(__dirname,"uploads")));
  


    app.get("/", (req, res) => {
        res.json({
            success: true,
            message: "API is Running"
        });
    });

    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        createAdmin();
    })
    .catch((err) => {
        console.log(err);
    });

    const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
  });
}

module.exports = app;