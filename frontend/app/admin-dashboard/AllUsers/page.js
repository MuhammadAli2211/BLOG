"use client";

import { useEffect, useState } from "react";
import API from "../../../lib/axios";
import "./AllUsers.css";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers();
  }, []);

  // Helper function to handle Cloudinary vs Dynamic Local Base URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    if (imagePath.startsWith("http")) return imagePath; // Cloudinary or External URL

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${imagePath}`; // Dynamic fallback URL
  };

  async function getUsers() {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");

      // Filter to list only normal users
      const onlyUsers = res.data.filter((user) => user.role === "user");

      setUsers(onlyUsers);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/users/${id}`);
      // Optimistic state update: UI fast update bina extra API call ke
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error deleting user");
    }
  }

  if (loading) {
    return <h2 className="loading">Loading Users...</h2>;
  }

  return (
    <div className="users-container">
      <h1 className="users-title">All Users</h1>

      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="profile-cell">
                    <img
                      src={getImageUrl(user.profile)}
                      alt={user.name || "User"}
                      className="profile-image"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </td>

                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td className="capitalize">{user.role}</td>

                  <td>{user.isVerified ? "Yes" : "No"}</td>

                  <td>
                    <button
                      type="button"
                      onClick={() => deleteUser(user._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-users">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}