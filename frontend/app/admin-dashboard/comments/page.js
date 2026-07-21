"use client";

import { useEffect, useState } from "react";
import API from "../../../lib/axios";
import "./comments.css";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    getComments();
  }, []);

  async function getComments() {
    try {
      const res = await API.get("/admin/comments");
      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setComment(item.comment);
  }

  async function updateComment(id) {
    try {
      await API.put(`/admin/comments/${id}`, {
        comment,
      });

      setEditingId(null);
      setComment("");
      getComments();
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteComment(id) {
    if (!confirm("Delete this comment?")) return;

    try {
      await API.delete(`/admin/comments/${id}`);
      getComments();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="comments-container">
  <h1 className="comments-title">All Comments</h1>

  {comments.map((item) => (
    <div key={item._id} className="comment-card">

      <p className="comment-user">
        User: {item.user?.name}
      </p>

      <p className="comment-post">
        Post: {item.post?.title}
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
              onClick={() => updateComment(item._id)}
              className="save-btn"
            >
              Save
            </button>

            <button
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
              onClick={() => handleEdit(item)}
              className="edit-btn"
            >
              Edit
            </button>

            <button
              onClick={() => deleteComment(item._id)}
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