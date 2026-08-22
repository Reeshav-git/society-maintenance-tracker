import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Society Maintenance Tracker
      </Link>
      <nav>
        {user ? (
          <>
            {user.role === "resident" && (
              <>
                <Link to="/resident">My Complaints</Link>
                <Link to="/resident/new">Raise Complaint</Link>
              </>
            )}
            {user.role === "admin" && (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/complaints">Complaints</Link>
                <Link to="/admin/notices">Notices</Link>
              </>
            )}
            <Link to="/notices">Notice Board</Link>
            <span className="user-pill">{user.name}</span>
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
