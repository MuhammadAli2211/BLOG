"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import API from "../../../../lib/axios";
import "./edit.css";

export default function EditPost() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [oldImage, setOldImage] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPost();
  }, [id]);

  // Cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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

  // File Select and New Image Preview with memory cleanup
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Safe Image URL Helper (Cloudinary vs Local Dynamic Fallback)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary URL

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${imagePath}`;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      if (image) {
        formData.append("image", image);
      }

      const res = await API.put(`/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data?.message || "Post updated successfully!");

      router.push("/user-dashboard/my-posts");
    } catch (err) {
      alert(err.response?.data?.message || "Update Failed");
    } finally {
      setLoading(false);
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

          {/* New Selected Image Preview OR Saved Old Image */}
          {(preview || oldImage) && (
            <img
              src={preview || getImageUrl(oldImage)}
              alt="Post Preview"
              className="preview-image"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Post"}
          </button>
        </form>
      </div>
    </div>
  );
}