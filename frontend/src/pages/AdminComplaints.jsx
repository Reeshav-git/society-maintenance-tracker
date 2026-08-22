import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { complaintApi } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    overdue: "",
  });
  const [error, setError] = useState("");

  const loadComplaints = () => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.overdue) params.overdue = filters.overdue;

    complaintApi
      .getAll(params)
      .then(setComplaints)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  return (
    <div className="page">
      <h1>All Complaints</h1>
      <div className="filters card">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Security">Security</option>
          <option value="Water Supply">Water Supply</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select
          value={filters.overdue}
          onChange={(e) => setFilters({ ...filters, overdue: e.target.value })}
        >
          <option value="">All</option>
          <option value="true">Overdue Only</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Resident</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Overdue</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id} className={c.isOverdue ? "overdue-row" : ""}>
                <td>{c.complaintId}</td>
                <td>{c.resident?.name}</td>
                <td>{c.category}</td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td>
                  <PriorityBadge priority={c.priority} />
                </td>
                <td>{c.isOverdue ? "Yes" : "No"}</td>
                <td>
                  <Link to={`/admin/complaints/${c._id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminComplaints;
