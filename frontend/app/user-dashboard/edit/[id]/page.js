"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import API from "../../../../lib/axios";
import "./edit.css";

const BASE_URL = "http://localhost:5000";

export default function EditPost() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [oldImage, setOldImage] = useState("");

  useEffect(() => {
    getPost();
  }, []);

  async function getPost() {
    try {
      const res = await API.get(`/posts/${id}`);

      setTitle(res.data.title);
      setDescription(res.data.description);
      setOldImage(res.data.image);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load post");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      if (image) {
        formData.append("image", image);
      }

      const res = await API.put(`/posts/${id}`, formData);

      alert(res.data.message);

      router.push("/user-dashboard/my-posts");
    } catch (err) {
      alert(err.response?.data?.message || "Update Failed");
    }
  }

  return (
    <div className="edit-post-page">
      <div className="edit-post-card">
        <h1>Edit Blog</h1>
        <p>Update your blog post.</p>

        <form onSubmit={handleSubmit} className="edit-post-form">
          <input
            type="text"
            placeholder="Edit Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Edit Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            required
          />

          {oldImage && (
            <img
              src={`${BASE_URL}${oldImage}`}
              alt="Post"
              className="preview-image"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button type="submit">Update Post</button>
        </form>
      </div>
    </div>
  );
}