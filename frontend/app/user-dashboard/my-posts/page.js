"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../lib/axios";
import "./my-post.css";

const BASE_URL = "http://localhost:5000";

export default function MyPosts() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getMyPosts();
  }, []);

  async function getMyPosts() {
    try {
      const res = await API.get("/posts/my-posts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function deletePost(id) {
    const confirmDelete = confirm("Are you sure?");

    if (!confirmDelete) return;

    try {
      const res = await API.delete(`/posts/${id}`);

      alert(res.data.message);

      getMyPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Delete Failed");
    }
  }

  return (
    <div className="my-posts-page">
      <h1 className="page-title">My Posts</h1>

      {posts.length === 0 ? (
        <h2 className="no-posts">No Posts Found</h2>
      ) : (
        posts.map((post) => (
          <div className="post-card" key={post._id}>
            <div className="user-info">
              <img
                src={
                  post.user?.profile
                    ? `${BASE_URL}${post.user.profile}`
                    : "https://via.placeholder.com/60"
                }
                alt="Profile"
                className="profile-image"
              />

              <p>{post.user?.name || "Unknown"}</p>
            </div>

            {post.image && (
              <img
                src={`${BASE_URL}${post.image}`}
                alt="Post"
                className="post-image"
              />
            )}

            <h2>{post.title}</h2>

            <p className="description">{post.description}</p>

            <div className="button-group">
              <button
                className="edit-btn"
                onClick={() =>
                  router.push(`/user-dashboard/edit/${post._id}`)
                }
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => deletePost(post._id)}
              >
                Delete
              </button>

              <button
                className="comment-btn"
                onClick={() =>
                  router.push(`/user-dashboard/comments/${post._id}`)
                }
              >
                Comments
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}