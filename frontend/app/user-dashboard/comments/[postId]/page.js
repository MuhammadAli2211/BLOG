"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "../../../../lib/axios";
import "../comments.css";

export default function CommentsPage() {
  const { postId } = useParams();

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editId, setEditId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getComments();

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function getComments() {
    try {
      const res = await API.get(`/comments/${postId}`);
      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function saveComment(e) {
    e.preventDefault();

    if (!commentText.trim()) {
      return alert("Comment is required");
    }

    try {
      if (editId) {
        await API.put(`/comments/${editId}`, {
          comment: commentText,
        });
        alert("Comment Updated");
      } else {
        await API.post(`/comments/${postId}`, {
          comment: commentText,
        });
        alert("Comment Added");
      }

      setCommentText("");
      setEditId(null);
      getComments();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  }

  function editComment(item) {
    setCommentText(item.comment);
    setEditId(item._id);
  }

  function cancelEdit() {
    setCommentText("");
    setEditId(null);
  }

  async function deleteComment(id) {
    if (!confirm("Delete this comment?")) return;

    try {
      await API.delete(`/comments/${id}`);
      alert("Comment Deleted");
      getComments();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  }

  // Cloudinary / Environment Dynamic Image URL Formatter
  const getProfileUrl = (profilePath) => {
    if (!profilePath) return null;
    if (profilePath.startsWith("http")) return profilePath; // Cloudinary URL

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${profilePath}`; // Dynamic Fallback
  };

  return (
    <div className="comments-container">
      <h1 className="comments-title">Comments</h1>

      <form onSubmit={saveComment} className="comment-form">
        <textarea
          rows="3"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="comment-textarea"
        />

        <div className="comment-form-actions">
          {editId && (
            <button type="button" onClick={cancelEdit} className="btn-cancel">
              Cancel
            </button>
          )}
          <button type="submit" className="btn-submit">
            {editId ? "Update Comment" : "Add Comment"}
          </button>
        </div>
      </form>

      <hr className="comments-divider" />

      {comments.length === 0 ? (
        <div className="empty-comments">
          No comments yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((item) => {
            const userName = item.user?.name || "Anonymous";
            const userInitial = userName.charAt(0).toUpperCase();
            const profileImage = getProfileUrl(item.user?.profile);

            // Safe ID check for current user comparison
            const currentUserId = user?._id || user?.id;
            const commentUserId = item.user?._id || item.user;
            const isOwner = user && currentUserId === commentUserId;

            return (
              <div key={item._id} className="comment-card">
                <div className="comment-header">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={userName}
                      className="comment-avatar-img"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="comment-avatar">{userInitial}</div>
                  )}
                  <h4 className="comment-author">{userName}</h4>
                </div>

                <p className="comment-text">{item.comment}</p>

                {isOwner && (
                  <div className="comment-actions">
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => editComment(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => deleteComment(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}