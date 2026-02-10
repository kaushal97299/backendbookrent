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

  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
