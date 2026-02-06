const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email",
      ],
    },

    // 🔐 STRONG PASSWORD VALIDATION
    password: {
      type: String,
      required: true,
      minlength: 8,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        "Password must contain uppercase, lowercase, number & special character",
      ],
    },

    status: {
      type: String,
      default: "active",
      enum: ["active", "blocked"],
    },

    role: {
      type: String,
      default: "client",
      enum: ["client", "admin"],
    },

    // OTP SYSTEM
    otp: {
      type: String,
      default: null,
    },

    otpExpire: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
