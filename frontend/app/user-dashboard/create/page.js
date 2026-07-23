"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../../lib/axios";
import "./create.css";

export default function CreatePost() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Unmount ya preview change hone par memory clear karne ke liye
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // File selection logic with preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview); // Purana URL revoke karein taake RAM waste na ho
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
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

      const res = await API.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data?.message || "Post created successfully!");
      router.push("/user-dashboard/my-posts");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-post-page">
      <div className="create-post-card">
        <h1>Create Blog</h1>
        <p>Share your ideas with the world.</p>

        <form onSubmit={handleSubmit} className="create-post-form">
          <input
            type="text"
            placeholder="Enter Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Write your blog..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* Image Preview */}
          {preview && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <img
                src={preview}
                alt="Selected Preview"
                style={{
                  maxHeight: "180px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Uploading to Cloudinary..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}