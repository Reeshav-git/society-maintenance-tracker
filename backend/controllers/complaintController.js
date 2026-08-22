const Complaint = require("../models/Complaint");
const generateComplaintId = require("../utils/generateComplaintId");
const syncOverdueFlags = require("../utils/syncOverdueFlags");
const { isComplaintOverdue } = require("../utils/overdueHelper");
const { sendComplaintStatusEmail } = require("../utils/notifications");
const {
  uploadToCloudinary,
  isCloudinaryConfigured,
} = require("../utils/uploadToCloudinary");

const VALID_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Security",
  "Water Supply",
  "Maintenance",
  "Other",
];

const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        message: "Category and description are required",
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    let photoUrl = "";

    if (req.file) {
      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          message: "Photo upload is not configured. Add Cloudinary credentials to .env",
        });
      }

      try {
        photoUrl = await uploadToCloudinary(req.file);
      } catch (error) {
        return res.status(500).json({
          message: "Photo upload failed",
          error: error.message,
        });
      }
    }

    const complaintId = await generateComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      resident: req.user._id,
      category,
      description,
      photoUrl,
      status: "OPEN",
      history: [
        {
          status: "OPEN",
          changedBy: req.user._id,
          note: "Complaint submitted",
          timestamp: new Date(),
        },
      ],
    });

    const populated = await Complaint.findById(complaint._id)
      .populate("resident", "name email apartmentNumber")
      .populate("history.changedBy", "name role");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ resident: req.user._id })
      .sort({ createdAt: -1 })
      .populate("history.changedBy", "name role");

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("resident", "name email apartmentNumber")
      .populate("history.changedBy", "name role");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (
      req.user.role === "resident" &&
      complaint.resident._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view this complaint" });
    }

    res.json(complaint);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    await syncOverdueFlags();

    const { category, status, fromDate, toDate, overdue } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (overdue === "true") {
      filter.isOverdue = true;
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const complaints = await Complaint.find(filter)
      .sort({ isOverdue: -1, createdAt: -1 })
      .populate("resident", "name email apartmentNumber")
      .populate("history.changedBy", "name role");

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];

const populateComplaint = (query) =>
  query
    .populate("resident", "name email apartmentNumber")
    .populate("history.changedBy", "name role");

const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const newStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.isClosed) {
      return res.status(400).json({ message: "Cannot update a closed complaint" });
    }

    if (complaint.status === newStatus) {
      return res.status(400).json({ message: "Complaint is already in this status" });
    }

    complaint.status = newStatus;
    complaint.history.push({
      status: newStatus,
      changedBy: req.user._id,
      note: note || "",
      timestamp: new Date(),
    });

    if (newStatus === "RESOLVED") {
      complaint.isClosed = true;
      complaint.isOverdue = false;
    } else {
      complaint.isOverdue = isComplaintOverdue(complaint);
    }

    await complaint.save();

    const updated = await populateComplaint(Complaint.findById(complaint._id));
    const complaintData = await updated;

    try {
      await sendComplaintStatusEmail(complaintData, note || "");
    } catch (emailError) {
      console.error("Status email failed:", emailError.message);
    }

    res.json(complaintData);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateComplaintPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({ message: "Priority is required" });
    }

    const newPriority = priority.toUpperCase();
    if (!VALID_PRIORITIES.includes(newPriority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.isClosed) {
      return res.status(400).json({ message: "Cannot update a closed complaint" });
    }

    if (complaint.priority === newPriority) {
      return res.status(400).json({ message: "Complaint already has this priority" });
    }

    complaint.priority = newPriority;
    await complaint.save();

    const updated = await populateComplaint(Complaint.findById(complaint._id));
    res.json(await updated);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
};
