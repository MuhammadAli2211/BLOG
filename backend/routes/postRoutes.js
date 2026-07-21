const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload")
const Post = require("../models/Post");
const auth = require("../middleware/auth");


// Total Likes of Logged-in User
router.get("/my-total-likes", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id });

    let totalLikes = 0;

    posts.forEach((post) => {
      totalLikes += post.likes.length;
      
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



router.get("/my-posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
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
        message: "All fields are required",
      });
    }

    const post = await Post.create({
      title,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      user: req.user.id,
    });
console.log(req.file);
    res.status(201).json({
      message: "Post created successfully",
      post,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});



//get all posts
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
    const post = await Post.findById(req.params.id)
      .populate("user","name email" );

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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this post",
      });
    }

    post.title = req.body.title;
    post.description = req.body.description;

    if (req.file) {
      post.image = `/uploads/${req.file.filename}`;
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
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
    const post = await Post.findById(req.params.id);

    // User ne pehle like kiya hua hai ya nahi
    let alreadyLiked = false;

    for (let i = 0; i < post.likes.length; i++) {
      if (post.likes[i].toString() === req.user.id) {
        alreadyLiked = true;
        break;
      }
    }

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((item) => {
        return item.toString() !== req.user.id;
      });

      await post.save();

      return res.json({
        message: "Post unliked",
        likes: post.likes.length,
      });
    }

    // Like
    post.likes.push(req.user.id);

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