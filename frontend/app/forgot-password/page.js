"use client";

import { useState } from "react";
import Link from "next/link";
import API from "@/lib/axios";
import "./forget-password.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function handleForgotPassword(e) {
    e.preventDefault();

    if (!email) {
      alert("Email is required");
      return;
    }

    try {
      const res = await API.post("/auth/forgot-password", {
        email,
      });

      alert(res.data.message);
      setEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  }
  

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Forgot Password</h1>

        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit">Send Reset Link</button>
        </form>

        <div className="link">
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}