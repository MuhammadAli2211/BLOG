"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "../../lib/axios";
import "./signup.css";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/signup", {
        name,
        email,
        password,
      });

      alert(res.data.message || "Account created successfully!");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Signup Failed";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>

        <form className="auth-form" onSubmit={handleSignup}>
          <input
            type="text"
            className="auth-input"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            className="auth-input"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Signup"}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}