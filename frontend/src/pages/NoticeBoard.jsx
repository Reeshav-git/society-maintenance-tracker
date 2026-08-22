import { useEffect, useState } from "react";
import { noticeApi } from "../services/api";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    noticeApi
      .getAll()
      .then(setNotices)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Notice Board</h1>
      {error && <p className="error">{error}</p>}
      <div className="notice-list">
        {notices.length === 0 ? (
          <p>No notices yet.</p>
        ) : (
          notices.map((notice) => (
            <article
              key={notice._id}
              className={`card notice-card ${notice.isImportant ? "important" : ""}`}
            >
              {notice.isImportant && (
                <span className="pin-badge">Important</span>
              )}
              <h2>{notice.title}</h2>
              <p>{notice.description}</p>
              <small>
                {new Date(notice.createdAt).toLocaleString()} · Posted by{" "}
                {notice.createdBy?.name}
              </small>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
