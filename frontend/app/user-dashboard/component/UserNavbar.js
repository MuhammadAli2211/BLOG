"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import "./UserNavbar.css";

export default function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  // Sync user data on route change / mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
    router.refresh();
  }

  function handleSearch(e) {
    e.preventDefault();

    if (search.trim() === "") {
      router.push("/user-dashboard");
      return;
    }

    router.push(`/user-dashboard?search=${encodeURIComponent(search.trim())}`);
  }

  // Helper for dynamic profile URL (Cloudinary vs Environment Fallback)
  const getProfileUrl = (profilePath) => {
    if (!profilePath) return null;
    if (profilePath.startsWith("http")) return profilePath; // Cloudinary URL

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}${profilePath}`;
  };

  const profileImg = getProfileUrl(user?.profile);

  return (
    <nav className="navbar">
      <h2 className="logo">
        <Link href="/user-dashboard">Blog App</Link>
      </h2>

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
        <Link href="/user-dashboard" className="nav-link">
          Home
        </Link>
        <Link href="/user-dashboard/my-posts" className="nav-link">
          My Posts
        </Link>
        <Link href="/user-dashboard/create" className="nav-link">
          Create Post
        </Link>

        {/* Profile Link with Avatar */}
        <Link
          href="/user-dashboard/profile"
          className="nav-link nav-profile-link"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {profileImg ? (
            <img
              src={profileImg}
              alt="Profile"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          Profile
        </Link>
      </div>

      <button onClick={handleLogout} className="nav-logout-btn">
        Log Out
      </button>
    </nav>
  );
}