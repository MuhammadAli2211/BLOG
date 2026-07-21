"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../lib/axios";
import "./create.css";

export default function CreatePost() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      if (image) {
        formData.append("image", image);
      }

      const res = await API.post("/posts", formData);

      alert(res.data.message);

      router.push("/user-dashboard/my-posts");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
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
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button type="submit">Create Post</button>
        </form>
      </div>
    </div>
  );
}