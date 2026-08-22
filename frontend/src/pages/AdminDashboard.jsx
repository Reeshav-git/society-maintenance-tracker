import { useEffect, useState } from "react";
import { dashboardApi } from "../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!stats) return <div className="page-center">Loading...</div>;

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Open</span>
          <strong>{stats.open}</strong>
        </div>
        <div className="stat-card">
          <span>In Progress</span>
          <strong>{stats.inProgress}</strong>
        </div>
        <div className="stat-card">
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
        </div>
        <div className="stat-card overdue">
          <span>Overdue</span>
          <strong>{stats.overdue}</strong>
        </div>
      </div>

      <div className="card">
        <h2>Complaints by Category</h2>
        <ul className="category-list">
          {Object.entries(stats.categories).map(([category, count]) => (
            <li key={category}>
              <span>{category}</span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
