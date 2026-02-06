const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "active",
    },

    role: {
      type: String,
      default: "client",
    },

    // 🔹 OTP SYSTEM
    otp: {
      type: String,
      default: null,
    },

    otpExpire: {
      type: Date,
      default: null,
    },

    // 🔹 EMAIL VERIFIED
    isVerified: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
