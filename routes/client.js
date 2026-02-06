const bcrypt = require("bcryptjs");
const Client = require("../models/clientschem");
const generateToken = require("../utils/jwt");
const nodemailer = require("nodemailer");

/* ================= EMAIL CONFIG ================= */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* ================= OTP ================= */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendMail = async (email, otp, subject) => {
  await transporter.sendMail({
    from: `"Auth Service" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`,
  });
};

module.exports = (app) => {

  /* ============ SIGNUP (NO OTP HERE) ============ */

  app.post("/api/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const exist = await Client.findOne({ email });
      if (exist)
        return res.status(400).json({ message: "User already exists" });

      const hash = await bcrypt.hash(password, 10);

      await Client.create({
        name,
        email,
        password: hash,
        isVerified: false,
      });

      res.json({
        message: "Signup successful. Verify email.",
        otpStep: true,
      });

    } catch (err) {
      console.log("SIGNUP:", err);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  /* ============ SEND OTP (NEW) ============ */

  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;

      const client = await Client.findOne({ email });
      if (!client)
        return res.status(400).json({ message: "User not found" });

      const otp = generateOTP();

      client.otp = otp;
      client.otpExpire = Date.now() + 5 * 60 * 1000;
      await client.save();

      await sendMail(email, otp, "Email Verification OTP");

      res.json({ message: "OTP sent" });

    } catch (err) {
      console.log("SEND OTP:", err);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  /* ============ LOGIN ============ */

  app.post("/api/clintlogin", async (req, res) => {
    try {
      const { email, password } = req.body;

      const client = await Client.findOne({ email });
      if (!client)
        return res.status(400).json({ message: "Invalid credentials" });

      if (!client.isVerified)
        return res.status(400).json({ message: "Verify email first" });

      const match = await bcrypt.compare(password, client.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      res.json({
        token: generateToken(client._id),
      });

    } catch (err) {
      console.log("LOGIN:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  /* ============ VERIFY OTP ============ */

  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;

      const client = await Client.findOne({ email });
      if (!client)
        return res.status(400).json({ message: "User not found" });

      if (client.otp !== otp || client.otpExpire < Date.now()) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      client.otp = null;
      client.otpExpire = null;
      client.isVerified = true;

      await client.save();

      res.json({
        token: generateToken(client._id),
      });

    } catch (err) {
      console.log("VERIFY:", err);
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  /* ============ FORGOT PASSWORD ============ */

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const client = await Client.findOne({ email });
      if (!client)
        return res.status(400).json({ message: "User not found" });

      const otp = generateOTP();

      client.otp = otp;
      client.otpExpire = Date.now() + 5 * 60 * 1000;
      await client.save();

      await sendMail(email, otp, "Reset Password OTP");

      res.json({ message: "OTP sent" });

    } catch (err) {
      console.log("FORGOT:", err);
      res.status(500).json({ message: "Failed" });
    }
  });

  /* ============ RESET PASSWORD ============ */

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email, otp, password } = req.body;

      const client = await Client.findOne({ email });

      if (!client || client.otp !== otp || client.otpExpire < Date.now()) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const hash = await bcrypt.hash(password, 10);

      client.password = hash;
      client.otp = null;
      client.otpExpire = null;

      await client.save();

      res.json({ message: "Password updated" });

    } catch (err) {
      console.log("RESET:", err);
      res.status(500).json({ message: "Reset failed" });
    }
  });

};
