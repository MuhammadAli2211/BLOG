"use client";

import { useEffect, useState } from "react";
import API from "../../lib/axios";
import { useSearchParams } from "next/navigation";
import "./admin-dashboard.css";

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    getPosts();
  }, [search]);

  async function getPosts() {
    try {
      const res = await API.get(`/admin/posts?search=${search}`);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
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
    try {
      await API.put(`/admin/posts/${id}`, formData);

      setEditingId(null);
      setFormData({
        title: "",
        description: "",
      });

      getPosts();
    } catch (err) {
      console.log(err);
    }
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;

    try {
      await API.delete(`/admin/posts/${id}`);
      getPosts();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">All Posts</h1>

      {posts.map((post) => (
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
                  onClick={() => updatePost(post._id)}
                  className="save-btn"
                >
                  Save
                </button>

                <button
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
                  src={`${BASE_URL}${post.image}`}
                  alt="Post"
                  className="post-image"
                />
              )}

              <p className="post-description">{post.description}</p>

              <p className="post-author">
                 {post.user?.name}
              </p>

              <div className="button-group">
                <button
                  onClick={() => handleEdit(post)}
                  className="edit-btn"
                >
                  Edit
                </button>

                <button
                  onClick={() => deletePost(post._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}