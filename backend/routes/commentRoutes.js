const express = require("express");
const router = express.Router();

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// Add Comment
router.post("/:postId", auth, async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    let newComment = await Comment.create({
      comment,
      user: req.user.id,
      post: req.params.postId,
    });

    newComment = await newComment.populate("user", "name profile");

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get Comments
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
    })
      .populate("user", "name profile")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
// Update Comment
router.put("/:id", auth, async (req, res) => {
  try {
    const { comment } = req.body;

    const oldComment = await Comment.findById(req.params.id);

    if (!oldComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (oldComment.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this comment",
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

// Delete Comment
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this comment",
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