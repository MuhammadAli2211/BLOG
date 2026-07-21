"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import API from "../../../lib/axios";
import "..reset-password.css";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleReset(e) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await API.post(`/reset-password/${token}`, {
        password,
      });

      alert(res.data.message);

      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Password Reset Failed");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Reset Password</h1>

        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit">Reset Password</button>
        </form>

        <div className="link">
          <Link href="/login">Back To Login</Link>
        </div>
      </div>
    </div>
  );
}