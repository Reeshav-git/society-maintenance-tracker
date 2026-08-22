const express = require("express");
const multer = require("multer");
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image must be under 5MB" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};

router.post(
  "/",
  protect,
  authorize("resident"),
  upload.single("photo"),
  handleUploadError,
  createComplaint
);
router.get("/my", protect, authorize("resident"), getMyComplaints);
router.get("/", protect, authorize("admin"), getAllComplaints);
router.put("/:id/status", protect, authorize("admin"), updateComplaintStatus);
router.put("/:id/priority", protect, authorize("admin"), updateComplaintPriority);
router.get("/:id", protect, getComplaintById);

module.exports = router;
