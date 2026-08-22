require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@society.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Society Admin";

  const existingAdmin = await User.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    console.log("Admin user already exists:", email);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin user created successfully");
  console.log("Email:", email);
  console.log("Password:", password);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
