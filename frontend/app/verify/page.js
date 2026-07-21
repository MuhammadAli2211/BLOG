"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import API from "../../lib/axios";
import "./verify.css"

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");

  async function handleVerify(e) {
    e.preventDefault();

    if (!email || !code) {
      alert("Email and OTP are required");
      return;
    }

    try {
      await API.post("/auth/verify", {
        email,
        code,
      });

      alert("Email Verified Successfully");

      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Verification Failed");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Verify Email</h1>

        <form onSubmit={handleVerify}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter 6 Digit OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button type="submit">Verify</button>
        </form>

        <div className="link">
          Already Verified? <Link href="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyContent />
    </Suspense>
  );
}