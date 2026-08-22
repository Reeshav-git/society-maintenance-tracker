import { useEffect, useState } from "react";
import { noticeApi } from "../services/api";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    isImportant: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    noticeApi
      .getAll()
      .then(setNotices)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await noticeApi.create(form);
      setForm({ title: "", description: "", isImportant: false });
      setMessage("Notice published");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await noticeApi.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>Manage Notices</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="card form-card wide" onSubmit={handleSubmit}>
        <h2>Create Notice</h2>
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>
        <label>
          Description
          <textarea
            rows="4"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.isImportant}
            onChange={(e) =>
              setForm({ ...form, isImportant: e.target.checked })
            }
          />
          Mark as important (pinned + email residents)
        </label>
        <button type="submit" className="btn-primary">
          Publish Notice
        </button>
      </form>

      <div className="notice-list">
        {notices.map((notice) => (
          <article key={notice._id} className="card notice-card">
            <h3>
              {notice.isImportant && "📌 "}
              {notice.title}
            </h3>
            <p>{notice.description}</p>
            <button
              type="button"
              className="btn-danger"
              onClick={() => handleDelete(notice._id)}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminNotices;
