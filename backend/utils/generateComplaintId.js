const Complaint = require("../models/Complaint");

const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  return `CMP-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateComplaintId;
