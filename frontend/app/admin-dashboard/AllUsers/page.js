"use client";

import { useEffect, useState } from "react";
import API from "../../../lib/axios";
import "./AllUsers.css";

const BASE_URL = "http://localhost:5000";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    try {
      const res = await API.get("/admin/users");

      const onlyUsers = res.data.filter(
        (user) => user.role === "user"
      );

      setUsers(onlyUsers);
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteUser(id) {
    const confirmDelete = window.confirm("Delete this user?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/users/${id}`);
      getUsers();
    } catch (err) {
      console.log(err);
    }
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
                  src={
                    user.profile
                      ? `${BASE_URL}${user.profile}`
                      : "/default-profile.png"
                  }
                  alt={user.name}
                  className="profile-image"
                  onError={(e) => {
                    e.currentTarget.src = "/default-profile.png";
                  }}
                />
              </td>

              <td>{user.name}</td>

              <td>{user.email}</td>

              <td className="capitalize">{user.role}</td>

              <td>
                {user.isVerified ? "Yes" : "No"}
              </td>

              <td>
                <button
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