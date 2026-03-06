const mongoose = require("mongoose");

/* ================= DOCUMENT SUB SCHEMA ================= */

const singleDocSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { _id: false }
);

/* ================= MAIN CLIENT SCHEMA ================= */

const clientSchema = new mongoose.Schema(
  {
    /* ================= BASIC ================= */

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      immutable: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    /* ================= PROFILE ================= */

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    /* ================= KYC DOCUMENTS ================= */

    documents: {
      aadhaar: {
        type: singleDocSchema,
        default: () => ({}),
      },

      pan: {
        type: singleDocSchema,
        default: () => ({}),
      },

      drivingLicense: {
        type: singleDocSchema,
        default: () => ({}),
      },
    },

    /* ================= GLOBAL KYC STATUS ================= */

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    /* ================= ACCOUNT ================= */

    status: {
      type: String,
      enum: ["active", "blocked", "deleted"],
      default: "active",
    },

    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

clientSchema.index({ email: 1 });

module.exports = mongoose.model("Client", clientSchema);
