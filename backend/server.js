const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "Society Maintenance Tracker API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongo: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notices", noticeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
