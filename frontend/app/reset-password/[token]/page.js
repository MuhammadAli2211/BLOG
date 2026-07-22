"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import API from "../../../lib/axios";
import "../reset-password.css";

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams();

  // ✅ Extract token safely from Next.js route params
  const token =
    params?.token ||
    params?.resetCode ||
    params?.id ||
    (Array.isArray(params) ? params[0] : "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();

    if (!token) {
      alert("Invalid or missing reset token. Please request a new reset link.");
      return;
    }

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
      setLoading(true);

      const res = await API.post(`/reset-password/${token}`, {
        password,
      });

      alert(res.data.message || "Password reset successful!");
      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Password Reset Failed");
    } finally {
      setLoading(false);
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

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="link">
          <Link href="/login">Back To Login</Link>
        </div>
      </div>
    </div>
  );
}