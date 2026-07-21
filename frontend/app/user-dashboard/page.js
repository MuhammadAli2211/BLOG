"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import API from "../../lib/axios";
import "./dashboard.css";

const BASE_URL = "http://localhost:5000";

export default function UserDashboard() {
  const [posts, setPosts] = useState([]);

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    getPosts();
  }, [search]);

  async function getPosts() {
    try {
      const res = await API.get(`/posts?search=${search}`);
      setPosts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  }

  async function handleLike(id) {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/posts/like/${id}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      getPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        
        <p>Explore all blog posts shared by the community</p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No Posts Found</h3>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              {post.image && (
                <img
                  src={`${BASE_URL}${post.image}`}
                  alt="Post"
                  className="post-image"
                />
              )}

              <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </div>

              <div className="post-footer">
                <div className="author-info">
                  <img
                    src={
                      post.user?.profile
                        ? `${BASE_URL}${post.user.profile}`
                        : "https://via.placeholder.com/60"
                    }
                    alt="Profile"
                    className="profile-image"
                  />

                  <div>
                    <h4>{post.user?.name || "Unknown"}</h4>
                    <span>Blog Author</span>
                  </div>
                </div>

                <div className="post-actions">
                  <button
                    className="like-btn"
                    onClick={() => handleLike(post._id)}
                  >
                    ❤️ {post.likes?.length || 0}
                  </button>

                  <button
                    className="comment-btn"
                    onClick={() =>
                      (window.location.href = `/user-dashboard/comments/${post._id}`)
                    }
                  >
                    💬 Comments
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}