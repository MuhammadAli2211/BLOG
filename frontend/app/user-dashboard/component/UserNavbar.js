"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./UserNavbar.css";

export default function UserNavbar() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  }

  function handleSearch(e) {
    e.preventDefault();

    if (search.trim() === "") {
      router.push("/user-dashboard");
      return;
    }

    router.push(`/user-dashboard?search=${encodeURIComponent(search)}`);
  }

  return (
 <nav className="navbar">
  <h2 className="logo">Blog App</h2>

  <form onSubmit={handleSearch} className="search-form">
    <input
      type="text"
      placeholder="Search title..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="search-input"
    />
    <button type="submit" className="search-btn">
      Search
    </button>
  </form>

  <div className="nav-right">
    <Link href="/user-dashboard" className="nav-link">Home</Link>
    <Link href="/user-dashboard/my-posts" className="nav-link">My Posts</Link>
    <Link href="/user-dashboard/create" className="nav-link">Create Post</Link>
    <Link href="/user-dashboard/profile" className="nav-link">Profile</Link>

  </div>
  
    <button onClick={handleLogout} className="nav-logout-btn">
      Log Out
    </button>
</nav>
  );
}