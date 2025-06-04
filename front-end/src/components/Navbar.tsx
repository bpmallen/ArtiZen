import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export default function NavBar() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid #eee",
      }}
    >
      <Link to="/" style={{ fontSize: "1.2rem", fontWeight: 600 }}>
        Art Explorer
      </Link>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <span>Welcome, {currentUser?.username}</span>
            <Link to="/collections">My Collections</Link>
            <button onClick={logout} style={{ cursor: "pointer" }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
