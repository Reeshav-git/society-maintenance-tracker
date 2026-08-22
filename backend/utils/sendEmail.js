const { Resend } = require("resend");

let resendClient = null;

const isEmailConfigured = () => Boolean(process.env.EMAIL_API_KEY);

const getResendClient = () => {
  if (!resendClient && isEmailConfigured()) {
    resendClient = new Resend(process.env.EMAIL_API_KEY);
  }
  return resendClient;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    console.log("Email not configured — skipping:", subject);
    return null;
  }

  const client = getResendClient();
  const from =
    process.env.EMAIL_FROM || "Society Tracker <onboarding@resend.dev>";

  const { data, error } = await client.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = { sendEmail, isEmailConfigured };
