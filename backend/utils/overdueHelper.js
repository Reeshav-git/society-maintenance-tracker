const getOverdueDays = () => parseInt(process.env.OVERDUE_DAYS, 10) || 3;

const getOverdueCutoffDate = () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - getOverdueDays());
  return cutoff;
};

const isComplaintOverdue = (complaint) => {
  if (complaint.status === "RESOLVED" || complaint.isClosed) {
    return false;
  }
  return new Date(complaint.createdAt) < getOverdueCutoffDate();
};

const getOverdueFilter = () => ({
  status: { $ne: "RESOLVED" },
  isClosed: { $ne: true },
  createdAt: { $lt: getOverdueCutoffDate() },
});

module.exports = {
  getOverdueDays,
  getOverdueCutoffDate,
  isComplaintOverdue,
  getOverdueFilter,
};
