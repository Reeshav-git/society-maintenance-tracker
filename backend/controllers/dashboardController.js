const Complaint = require("../models/Complaint");
const syncOverdueFlags = require("../utils/syncOverdueFlags");
const { getOverdueDays } = require("../utils/overdueHelper");

const getDashboard = async (req, res) => {
  try {
    await syncOverdueFlags();

    const [statusStats, overdue, categoryStats] = await Promise.all([
      Complaint.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: {
              $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] },
            },
            resolved: {
              $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] },
            },
          },
        },
      ]),
      Complaint.countDocuments({ isOverdue: true }),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const stats = statusStats[0] || {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
    };

    const categories = {};
    categoryStats.forEach((item) => {
      categories[item._id] = item.count;
    });

    res.json({
      total: stats.total,
      open: stats.open,
      inProgress: stats.inProgress,
      resolved: stats.resolved,
      overdue,
      overdueDays: getOverdueDays(),
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboard };
