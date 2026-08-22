const User = require("../models/User");
const { sendEmail } = require("./sendEmail");

const formatStatus = (status) =>
  status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

const sendComplaintStatusEmail = async (complaint, note) => {
  const resident = complaint.resident;

  if (!resident?.email) {
    return;
  }

  const subject = `Complaint ${complaint.complaintId} — Status Updated`;
  const html = `
    <h2>Your complaint has been updated</h2>
    <p>Hi ${resident.name},</p>
    <p>Your complaint <strong>${complaint.complaintId}</strong> has a new status.</p>
    <p><strong>New Status:</strong> ${formatStatus(complaint.status)}</p>
    ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
    <p>Category: ${complaint.category}</p>
    <p>— Society Maintenance Tracker</p>
  `;

  await sendEmail({
    to: resident.email,
    subject,
    html,
  });
};

const sendImportantNoticeEmail = async (notice) => {
  const residents = await User.find({ role: "resident" }).select("email name");

  if (residents.length === 0) {
    return;
  }

  const subject = `Important Society Notice: ${notice.title}`;
  const html = `
    <h2>Important Society Notice</h2>
    <p><strong>${notice.title}</strong></p>
    <p>${notice.description}</p>
    <p>— Society Maintenance Tracker</p>
  `;

  await Promise.all(
    residents.map((resident) =>
      sendEmail({
        to: resident.email,
        subject,
        html,
      })
    )
  );
};

module.exports = {
  sendComplaintStatusEmail,
  sendImportantNoticeEmail,
};
