"use client";

import { useEffect, useState, Suspense } from "react";
import API from "../../lib/axios";
import { useSearchParams } from "next/navigation";
import "./admin-dashboard.css";

function AdminDashboardContent() {
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    getPosts();
  }, [search]);

  // Dynamic Image URL Helper (Cloudinary vs Environment Fallback)
  const getImageUrl = (
    imagePath,
    placeholder = "https://via.placeholder.com/300"
  ) => {
    if (!imagePath) return placeholder;
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary URL

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${imagePath}`; // Legacy local uploads fallback
  };

  async function getPosts() {
    try {
      setLoading(true);
      const res = await API.get(`/admin/posts?search=${encodeURIComponent(search)}`);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(post) {
    setEditingId(post._id);
    setFormData({
      title: post.title,
      description: post.description,
    });
  }

  async function updatePost(id) {
    if (!formData.title.trim() || !formData.description.trim()) {
      return alert("Title and Description cannot be empty");
    }

    try {
      await API.put(`/admin/posts/${id}`, formData);

      // Optimistic state update for instant UI feedback
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id
            ? { ...post, title: formData.title, description: formData.description }
            : post
        )
      );

      setEditingId(null);
      setFormData({
        title: "",
        description: "",
      });
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to update post");
    }
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;

    try {
      await API.delete(`/admin/posts/${id}`);
      
      // Optimistic state update: Fast UI response
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to delete post");
    }
  }

  if (loading) {
    return <h2 className="loading">Loading Posts...</h2>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">All Posts</h1>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts found.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="post-card">
            {editingId === post._id ? (
              <>
                <input
                  type="text"
                  className="post-input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />

                <textarea
                  rows={4}
                  className="post-textarea"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />

                <div className="button-group">
                  <button
                    type="button"
                    onClick={() => updatePost(post._id)}
                    className="save-btn"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: "",
                        description: "",
                      });
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="post-title">{post.title}</h2>

                {post.image && (
                  <img
                    src={getImageUrl(post.image)}
                    alt={post.title || "Post"}
                    className="post-image"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300";
                    }}
                  />
                )}

                <p className="post-description">{post.description}</p>

                <p className="post-author">
                  <strong>Author:</strong> {post.user?.name || "Unknown Author"}
                </p>

                <div className="button-group">
                  <button
                    type="button"
                    onClick={() => handleEdit(post)}
                    className="edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePost(post._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}