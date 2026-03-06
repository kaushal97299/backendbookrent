const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
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

    password: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      default: "local",
    },

    /* PROFILE INFO */
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

    /* ADDRESS INFO */
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

    /* USER ROLE (ONLY USER) */
    role: {
      type: String,
      default: "user",
      immutable: true, // ❗ change nahi ho sakta
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);