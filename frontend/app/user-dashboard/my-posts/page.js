"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "../../../lib/axios";
import "./my-post.css";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getMyPosts();
  }, []);

  // Dynamic Image URL Helper (Cloudinary vs Environment Fallback)
  const getImageUrl = (imagePath, placeholder = "https://via.placeholder.com/150") => {
    if (!imagePath) return placeholder;
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary URL

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${imagePath}`; // Local/Dynamic legacy fallback
  };

  async function getMyPosts() {
    try {
      const res = await API.get("/posts/my-posts");
      setPosts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching posts");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await API.delete(`/posts/${id}`);
      setPosts(posts.filter((post) => post._id !== id));
      alert("Post deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting post");
    }
  }

  return (
    <div className="my-posts-page">
      <h1>My Posts</h1>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No Posts Created Yet</h3>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              {post.image && (
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title || "Post"}
                  className="post-image"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </div>

              <div className="post-actions">
                <Link
                  href={`/user-dashboard/edit/${post._id}`}
                  className="edit-btn"
                >
                  Edit Post
                </Link>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDelete(post._id)}
                >
                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}