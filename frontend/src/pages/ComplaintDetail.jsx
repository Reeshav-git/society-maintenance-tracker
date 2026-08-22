import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { complaintApi } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const ComplaintDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    complaintApi
      .getById(id)
      .then(setComplaint)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!complaint) return <div className="page-center">Loading...</div>;

  return (
    <div className="page">
      <h1>{complaint.complaintId}</h1>
      <div className="grid-2">
        <div className="card">
          <p>
            <strong>Category:</strong> {complaint.category}
          </p>
          <p>
            <strong>Status:</strong> <StatusBadge status={complaint.status} />
          </p>
          <p>
            <strong>Priority:</strong>{" "}
            <PriorityBadge priority={complaint.priority} />
          </p>
          {complaint.isOverdue && (
            <p className="overdue-tag">Overdue</p>
          )}
          <p>
            <strong>Description:</strong> {complaint.description}
          </p>
          {complaint.photoUrl && (
            <img
              src={complaint.photoUrl}
              alt="Complaint"
              className="complaint-photo"
            />
          )}
        </div>
        <div className="card">
          <h2>Status History</h2>
          <ul className="history-list">
            {complaint.history.map((entry, index) => (
              <li key={index}>
                <div className="history-top">
                  <StatusBadge status={entry.status} />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <p>{entry.note || "—"}</p>
                <small>
                  By: {entry.changedBy?.name || "Unknown"} (
                  {entry.changedBy?.role || "user"})
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
