import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { complaintApi } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const AdminComplaintManage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "", note: "" });
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    complaintApi
      .getById(id)
      .then((data) => {
        setComplaint(data);
        setStatusForm({ status: data.status, note: "" });
        setPriority(data.priority);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await complaintApi.updateStatus(id, statusForm);
      setMessage("Status updated successfully");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePriorityUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await complaintApi.updatePriority(id, { priority });
      setMessage("Priority updated successfully");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !complaint) {
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!complaint) return <div className="page-center">Loading...</div>;

  return (
    <div className="page">
      <h1>Manage {complaint.complaintId}</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid-2">
        <div className="card">
          <p>
            <strong>Resident:</strong> {complaint.resident?.name} (
            {complaint.resident?.apartmentNumber})
          </p>
          <p>
            <strong>Category:</strong> {complaint.category}
          </p>
          <p>
            <strong>Current Status:</strong>{" "}
            <StatusBadge status={complaint.status} />
          </p>
          <p>
            <strong>Priority:</strong>{" "}
            <PriorityBadge priority={complaint.priority} />
          </p>
          <p>{complaint.description}</p>
          {complaint.photoUrl && (
            <img src={complaint.photoUrl} alt="" className="complaint-photo" />
          )}
        </div>

        <div className="card">
          {!complaint.isClosed && (
            <>
              <form onSubmit={handleStatusUpdate} className="stack-form">
                <h2>Update Status</h2>
                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, status: e.target.value })
                  }
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <textarea
                  placeholder="Optional note"
                  value={statusForm.note}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, note: e.target.value })
                  }
                />
                <button type="submit" className="btn-primary">
                  Update Status
                </button>
              </form>

              <form onSubmit={handlePriorityUpdate} className="stack-form">
                <h2>Update Priority</h2>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <button type="submit" className="btn-secondary">
                  Update Priority
                </button>
              </form>
            </>
          )}

          <h2>History</h2>
          <ul className="history-list">
            {complaint.history.map((entry, index) => (
              <li key={index}>
                <div className="history-top">
                  <StatusBadge status={entry.status} />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <p>{entry.note || "—"}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintManage;
