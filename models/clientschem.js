const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    status: { type: String, default: "active" },
    role: { type: String, default: "client" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
