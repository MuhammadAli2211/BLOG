"use client";

import { useEffect, useState } from "react";
import API from "../../../lib/axios";
import "./comments.css";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComments();
  }, []);

  async function getComments() {
    try {
      setLoading(true);
      const res = await API.get("/admin/comments");
      setComments(res.data);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setComment(item.comment);
  }

  async function updateComment(id) {
    if (!comment.trim()) {
      return alert("Comment cannot be empty");
    }

    try {
      await API.put(`/admin/comments/${id}`, {
        comment,
      });

      // Optimistic state update: Local state update bina extra API call ke
      setComments((prevComments) =>
        prevComments.map((item) =>
          item._id === id ? { ...item, comment } : item
        )
      );

      setEditingId(null);
      setComment("");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to update comment");
    }
  }

  async function deleteComment(id) {
    if (!confirm("Delete this comment?")) return;

    try {
      await API.delete(`/admin/comments/${id}`);

      // Optimistic state update: Fast UI response
      setComments((prevComments) =>
        prevComments.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  }

  if (loading) {
    return <h2 className="loading">Loading Comments...</h2>;
  }

  return (
    <div className="comments-container">
      <h1 className="comments-title">All Comments</h1>

      {comments.length === 0 ? (
        <div className="empty-state">
          <p>No comments found.</p>
        </div>
      ) : (
        comments.map((item) => (
          <div key={item._id} className="comment-card">
            <p className="comment-user">
              <strong>User:</strong> {item.user?.name || "Deleted User"}
            </p>

            <p className="comment-post">
              <strong>Post:</strong> {item.post?.title || "Deleted Post"}
            </p>

            {editingId === item._id ? (
              <>
                <textarea
                  className="comment-textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div className="button-group">
                  <button
                    type="button"
                    onClick={() => updateComment(item._id)}
                    className="save-btn"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setComment("");
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="comment-text">{item.comment}</p>

                <div className="button-group">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteComment(item._id)}
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