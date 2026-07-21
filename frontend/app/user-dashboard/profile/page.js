"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../../lib/axios";
import "./profile.css";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [file, setFile] = useState(null);
  const [totalLikes, setTotalLikes] = useState(0);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const data = localStorage.getItem("user");

    if (!data) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(data);

    setUser(userData);
    setName(userData.name);
    setEmail(userData.email);

    getTotalLikes();
  }, [router]);

  async function getTotalLikes() {
    try {
      const res = await API.get("/posts/my-total-likes");
      setTotalLikes(res.data.totalLikes);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpload() {
    if (!file) {
      return alert("Please select image");
    }

    try {
      const formData = new FormData();
      formData.append("profile", file);

      const res = await API.put("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = {
        ...user,
        profile: res.data.user.profile,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile Updated Successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Upload Failed");
    }
  }

  async function handleUpdateProfile() {
    try {
      const res = await API.put("/auth/update-profile", {
        name,
        email,
        password,
      });

      setUser(res.data.user);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      setPassword("");
      setEditing(false);

      alert("Profile Updated Successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Update Failed");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (!user) {
    return <h2 className="loading">Loading...</h2>;
  }
    return (
    <div className="profile-page">
      <div className="profile-card">

        <h1>My Profile</h1>

        <div className="profile-image-box">
          <img
            src={
              user.profile
                ? `${BASE_URL}${user.profile}`
                : "https://via.placeholder.com/150"
            }
            className="profile-image"
            alt="Profile"
          />
        </div>

        <div className="likes-box">
          ❤️ Total Likes : <span>{totalLikes}</span>
        </div>

        {editing ? (
          <>
            <div className="upload-section">

              <label
                htmlFor="profileImage"
                className="upload-box"
              >
                <div className="upload-icon">📷</div>

                <p>
                  {file
                    ? file.name
                    : "Choose Profile Image"}
                </p>

                <span>PNG, JPG, JPEG</span>
              </label>

              <input
                hidden
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
              />

              <button
                className="upload-btn"
                onClick={handleUpload}
              >
                Upload Picture
              </button>

            </div>

            <div className="user-info">

              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <label>New Password</label>
              <input
                type="password"
                placeholder="Leave empty if not changing"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                className="save-btn"
                onClick={handleUpdateProfile}
              >
                Save Changes
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setEditing(false);
                  setName(user.name);
                  setEmail(user.email);
                  setPassword("");
                }}
              >
                Cancel
              </button>

            </div>
          </>
        ) : (
          <div className="user-info">

            <div className="info-card">
              <h4>Name</h4>
              <p>{user.name}</p>
            </div>

            <div className="info-card">
              <h4>Email</h4>
              <p>{user.email}</p>
            </div>

            <div className="info-card">
              <h4>Role</h4>
              <p>{user.role}</p>
            </div>

            <button
              className="edit-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>

          </div>
        )}

        <button
          className="logOut-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </div>
  );
}