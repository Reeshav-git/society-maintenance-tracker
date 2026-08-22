const Notice = require("../models/Notice");
const { sendImportantNoticeEmail } = require("../utils/notifications");

const createNotice = async (req, res) => {
  try {
    const { title, description, isImportant } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const notice = await Notice.create({
      title,
      description,
      isImportant: isImportant === true || isImportant === "true",
      createdBy: req.user._id,
    });

    const populated = await Notice.findById(notice._id).populate(
      "createdBy",
      "name email role"
    );

    if (notice.isImportant) {
      try {
        await sendImportantNoticeEmail(populated);
      } catch (emailError) {
        console.error("Important notice email failed:", emailError.message);
      }
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ isImportant: -1, createdAt: -1 })
      .populate("createdBy", "name email role");

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const { title, description, isImportant } = req.body;

    if (title !== undefined) notice.title = title;
    if (description !== undefined) notice.description = description;
    if (isImportant !== undefined) {
      notice.isImportant = isImportant === true || isImportant === "true";
    }

    if (!notice.title || !notice.description) {
      return res.status(400).json({
        message: "Title and description cannot be empty",
      });
    }

    await notice.save();

    const updated = await Notice.findById(notice._id).populate(
      "createdBy",
      "name email role"
    );

    res.json(updated);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    await notice.deleteOne();

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
};
