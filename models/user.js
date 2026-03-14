const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  /* ================= BASIC INFO ================= */

  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
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
    },
    minlength: [8, "Password must be at least 8 characters long"],
    maxlength: [100, "Password cannot exceed 100 characters"]
  },

  /* ================= OTP SIGNUP ================= */

  signupOtp: {
    type: String,
    default: null
  },

  signupOtpExpire: {
    type: Date,
    default: null
  },

  /* ================= PROFILE INFO ================= */

  phone: {
    type: String,
    default: "",
    match: [/^[0-9]{10}$|^$/, "Phone number must be 10 digits"]
  },

  bio: {
    type: String,
    default: "",
    maxlength: [200, "Bio cannot exceed 200 characters"],
  },

  emergency: {
    type: String,
    default: "",
    match: [/^[0-9]{10}$|^$/, "Emergency contact must be 10 digits"]
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
    match: [/^[1-9][0-9]{6}$|^$/, "Pincode must be 6 digits"]
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


tempPassword: {
  type: String,
  default: null
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