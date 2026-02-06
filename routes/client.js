const bcrypt = require("bcryptjs");
const Client = require("../models/clientschem");
const generateToken = require("../utils/jwt");
const nodemailer = require("nodemailer");

/* ================= EMAIL CONFIG (RENDER FIX) ================= */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Test mail config (Debug)
transporter.verify((err, success) => {
  if (err) {
    console.log("❌ Mail Error:", err);
  } else {
    console.log("✅ Mail Server Ready");
  }
});

/* ================= OTP GENERATOR ================= */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = (app) => {

  /* ============ SIGNUP ============ */

  app.post("/api/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const exist = await Client.findOne({ email });
      if (exist)
        return res.status(400).json({ message: "User already exists" });

      const hash = await bcrypt.hash(password, 10);

      const otp = generateOTP();

      const client = await Client.create({
        name,
        email,
        password: hash,
        otp,
        otpExpire: Date.now() + 5 * 60 * 1000,
        isVerified: false,
      });

      await transporter.sendMail({
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Account - OTP",
        html: `
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>Valid for 5 minutes</p>
        `,
      });

      res.json({
        message: "OTP sent to email",
        otpRequired: true,
      });

    } catch (err) {
      console.log("Signup Error:", err);
      res.status(500).json({ message: "Signup failed" });
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

      const otp = generateOTP();

      client.otp = otp;
      client.otpExpire = Date.now() + 5 * 60 * 1000;
      await client.save();

      await transporter.sendMail({
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Login OTP",
        html: `
          <h2>Login Verification</h2>
          <h1>${otp}</h1>
          <p>Valid for 5 minutes</p>
        `,
      });

      res.json({
        message: "OTP sent",
        otpRequired: true,
      });

    } catch (err) {
      console.log("Login Error:", err);
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
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      client.otp = null;
      client.otpExpire = null;
      client.isVerified = true;

      await client.save();

      res.json({
        token: generateToken(client._id),
      });

    } catch (err) {
      console.log("Verify Error:", err);
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

      await transporter.sendMail({
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Password OTP",
        html: `
          <h2>Password Reset</h2>
          <h1>${otp}</h1>
          <p>Valid for 5 minutes</p>
        `,
      });

      res.json({ message: "OTP sent" });

    } catch (err) {
      console.log("Forgot Error:", err);
      res.status(500).json({ message: "Failed to send OTP" });
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
      console.log("Reset Error:", err);
      res.status(500).json({ message: "Reset failed" });
    }
  });

};
