import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { complaintApi } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const ResidentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    complaintApi
      .my()
      .then(setComplaints)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Complaints</h1>
        <Link to="/resident/new" className="btn-primary">
          Raise Complaint
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="6">No complaints yet.</td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.complaintId}</td>
                  <td>{c.category}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/complaints/${c._id}`}>View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResidentDashboard;
