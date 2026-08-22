const express = require("express");
const {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getNotices);
router.post("/", protect, authorize("admin"), createNotice);
router.put("/:id", protect, authorize("admin"), updateNotice);
router.delete("/:id", protect, authorize("admin"), deleteNotice);

module.exports = router;
