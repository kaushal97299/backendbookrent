const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    provider: { type: String, default: "local" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
