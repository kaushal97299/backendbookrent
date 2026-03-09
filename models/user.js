const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  /* ================= BASIC INFO ================= */

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    }
  },

  /* ================= PROFILE INFO ================= */

  phone: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
    maxlength: 200,
  },

  emergency: {
    type: String,
    default: "",
  },

  avatar: {
    type: String,
    default: "",
  },

  dob: {
    type: String,
    default: "",
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: "",
  },

  /* ================= ADDRESS INFO ================= */

  address: {
    type: String,
    default: "",
  },

  village: {
    type: String,
    default: "",
  },

  district: {
    type: String,
    default: "",
  },

  state: {
    type: String,
    default: "",
  },

  pincode: {
    type: String,
    default: "",
  },

  /* ================= ROLE ================= */

  role: {
    type: String,
    default: "user",
    immutable: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  /* ================= PASSWORD RESET ================= */

  resetToken: {
    type: String,
    default: null
  },

  resetTokenExpire: {
    type: Date,
    default: null
  }

},
{
  timestamps: true,
}
);

module.exports = mongoose.model("User", userSchema);