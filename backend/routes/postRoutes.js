const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// Helper to reliably extract User ID from JWT Payload
const getUserId = (user) => user?._id || user?.id;

// Total Likes of Logged-in User
router.get("/my-total-likes", auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const posts = await Post.find({ user: userId });

    let totalLikes = 0;

    posts.forEach((post) => {
      totalLikes += post.likes ? post.likes.length : 0;
    });

    res.status(200).json({
      totalLikes,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get My Posts
router.get("/my-posts", auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const posts = await Post.find({ user: userId })
      .populate("user", "name profile")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
// Create Post
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Direct check - Function dependency khatam
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User payload invalid or missing",
      });
    }

    // Safe extraction of Cloudinary URL
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || "";
    }

    const post = await Post.create({
      title,
      description,
      image: imageUrl,
      user: userId,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({
      message: err.message || "Failed to create post",
    });
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    const posts = await Post.find(filter)
      .populate("user", "name email profile")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get Single Post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "name email profile"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Update Post
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.user.toString() !== userId?.toString()) {
      return res.status(403).json({
        message: "You are not allowed to update this post",
      });
    }

    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;

    if (req.file) {
      post.image = req.file.path || req.file.secure_url || post.image;
    }

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

// Delete Post
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.user.toString() !== userId?.toString()) {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
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

// Like / Unlike Post
router.put("/like/:id", auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let alreadyLiked = post.likes.some(
      (item) => item.toString() === userId?.toString()
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (item) => item.toString() !== userId?.toString()
      );

      await post.save();

      return res.json({
        message: "Post unliked",
        likes: post.likes.length,
      });
    }

    // Like
    post.likes.push(userId);

    await post.save();

    res.json({
      message: "Post liked",
      likes: post.likes.length,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;