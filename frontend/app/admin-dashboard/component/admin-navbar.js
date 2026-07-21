"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./admin-navbar.css";



export default function AdminNavbar() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function handleSearch(e) {
    e.preventDefault();
    router.push(`/admin-dashboard?search=${search}`);
  }

  return (
    <nav className="admin-navbar">
  <div className="admin-navbar-container">

    <h1 className="admin-logo">Admin</h1>

    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        placeholder="Search post..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <button className="search-btn">
        Search
      </button>
    </form>

    <div className="nav-links">
      <Link href="/admin-dashboard">Dashboard</Link>
      <Link href="/admin-dashboard/AllUsers">Users</Link>
      <Link href="/admin-dashboard/comments">Comments</Link>

    </div>
    
      <button
        onClick={handleLogout}
        className="logout-btn"
      >
        Logout
      </button>


  </div>
</nav>
  );
} 