import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { complaintApi } from "../services/api";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Security",
  "Water Supply",
  "Maintenance",
  "Other",
];

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ category: "", description: "" });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (photo) formData.append("photo", photo);

      const data = await complaintApi.create(formData);
      setSuccess(`Complaint submitted! ID: ${data.complaintId}`);
      setTimeout(() => navigate(`/complaints/${data._id}`), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>Raise Complaint</h1>
      <form className="card form-card wide" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description
          <textarea
            rows="5"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
          />
        </label>
        <label>
          Photo (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
        </label>
        <button type="submit" className="btn-primary">
          Submit Complaint
        </button>
      </form>
    </div>
  );
};

export default RaiseComplaint;
