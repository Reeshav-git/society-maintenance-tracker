const Complaint = require("../models/Complaint");
const { getOverdueCutoffDate } = require("./overdueHelper");

const syncOverdueFlags = async () => {
  const cutoff = getOverdueCutoffDate();

  await Complaint.updateMany(
    {
      status: { $ne: "RESOLVED" },
      isClosed: { $ne: true },
      createdAt: { $lt: cutoff },
      isOverdue: { $ne: true },
    },
    { $set: { isOverdue: true } }
  );

  await Complaint.updateMany(
    {
      isOverdue: true,
      $or: [
        { status: "RESOLVED" },
        { isClosed: true },
        { createdAt: { $gte: cutoff } },
      ],
    },
    { $set: { isOverdue: false } }
  );
};

module.exports = syncOverdueFlags;
