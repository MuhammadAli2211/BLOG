const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../emails/sendEmail");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// ================= Signup =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (user) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      verificationCode,
      isVerified: false
    });

    await sendEmail(
      email,
      "Verify Your Email",
      `
        <h2>Blog App</h2>
        <p>Your OTP Code:</p>
        <h1>${verificationCode}</h1>
        `
    );

    res.status(201).json({
      message: "Signup successful. Check your email for OTP.",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Verify OTP =================
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne(
      {
        email: email.toLowerCase().trim(),
        verificationCode: code,
      }
    );

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or OTP",
      });
    }

    user.isVerified = true;
    user.verificationCode = "";

    await user.save();

    res.json({
      message: "Account Verified Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Login =================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    // JWT Token Generate
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Forgot Password =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetCode = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Correct (Quotes hata kar cleanest dynamic URL):
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const resetUrl = `${frontendUrl}/reset-password/${resetCode}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `
        <h2>Reset Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    );

    res.json({
      message: "Reset password link sent successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Reset Password =================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or Expired Token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      message: "Password Reset Successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.put(
  "/profile",
  auth,
  upload.single("profile"),
  async (req, res) => {

    try {

      const user = await User.findById(req.user.id);

      if (!user) {

        return res.status(404).json({
          message: "User not found"
        });

      }

      if (req.file) {

        user.profile = "/uploads/" + req.file.filename;

      }

      await user.save();

      res.json({

        message: "Profile Updated Successfully",

        user

      });

    }

    catch (err) {

      res.status(500).json({

        message: err.message

      });

    }

  });



router.put("/update-profile", auth, async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Email already exists?
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    user.name = name.trim();
    user.email = email.toLowerCase().trim();

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      message: "Profile Updated Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});

module.exports = router;
