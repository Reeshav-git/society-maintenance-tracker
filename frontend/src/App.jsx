import { useEffect, useState } from "react";
import { getHealth } from "./services/api";
import API_URL from "./services/api";
import "./App.css";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="app">
      <section className="hero-card">
        <p className="badge">Society Maintenance Tracker</p>
        <h1>Maintenance complaints, simplified</h1>
        <p className="subtitle">
          Residents raise and track complaints. Admins manage workflow,
          priorities, notices, and overdue alerts.
        </p>

        <div className="status-card">
          <h2>API Status</h2>
          <p className="api-url">{API_URL}</p>
          {health && (
            <ul>
              <li>
                Server: <strong>{health.status}</strong>
              </li>
              <li>
                MongoDB: <strong>{health.mongo}</strong>
              </li>
            </ul>
          )}
          {error && <p className="error">Could not reach API: {error}</p>}
        </div>

        <p className="note">
          Backend API is live. Full React UI pages can be added on top of the
          existing REST endpoints documented in README.md.
        </p>
      </section>
    </main>
  );
}

export default App;
