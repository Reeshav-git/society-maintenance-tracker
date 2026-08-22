const labels = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

const StatusBadge = ({ status }) => (
  <span className={`badge status-${status?.toLowerCase()}`}>
    {labels[status] || status}
  </span>
);

export default StatusBadge;
