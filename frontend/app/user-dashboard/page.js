"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import API from "../../lib/axios";
import "./dashboard.css";

function DashboardContent() {
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    getPosts();
  }, [search]);

  // Dynamic Image URL Helper (Cloudinary vs Environment Fallback)
  const getImageUrl = (
    imagePath,
    placeholder = "https://via.placeholder.com/150"
  ) => {
    if (!imagePath) return placeholder;
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary URL

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${imagePath}`; // Legacy local uploads fallback
  };

  async function getPosts() {
    try {
      const res = await API.get(`/posts?search=${encodeURIComponent(search)}`);
      setPosts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching posts");
    }
  }

  async function handleLike(id) {
    try {
      await API.put(`/posts/like/${id}`);
      getPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Error liking post");
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

              <div className="post-footer">
                <div className="author-info">
                  <img
                    src={getImageUrl(
                      post.user?.profile,
                      "https://via.placeholder.com/60"
                    )}
                    alt="Profile"
                    className="profile-image"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/60";
                    }}
                  />

                  <div>
                    <h4>{post.user?.name || "Unknown"}</h4>
                    <span>Blog Author</span>
                  </div>
                </div>

                <div className="post-actions">
                  <button
                    type="button"
                    className="like-btn"
                    onClick={() => handleLike(post._id)}
                  >
                    ❤️ {post.likes?.length || 0}
                  </button>

                  <button
                    type="button"
                    className="comment-btn"
                    onClick={() =>
                      router.push(`/user-dashboard/comments/${post._id}`)
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

export default function UserDashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}