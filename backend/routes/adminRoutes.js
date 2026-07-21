const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const auth = require("../middleware/auth");

// ================= Get All Users =================
router.get("/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Delete User =================
router.delete("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Get All Posts =================
router.get("/posts", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }
     const { search } = req.query;

    let filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    const posts = await Post.find()
      .populate("user", "name email profile")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Update Any Post =================
router.put("/posts/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const { title, description } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.title = title;
    post.description = description;

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Delete Any Post =================
router.delete("/posts/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Get All Comments =================
router.get("/comments", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const comments = await Comment.find()
      .populate("user", "name profile")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Update Any Comment =================
router.put("/comments/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const { comment } = req.body;

    const oldComment = await Comment.findById(req.params.id);

    if (!oldComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    oldComment.comment = comment;

    await oldComment.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment: oldComment,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= Delete Any Comment =================
router.delete("/comments/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;