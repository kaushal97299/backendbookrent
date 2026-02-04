const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client", // 👈 same as your client model
      required: true,
    },

    name: String,
    brand: String,
    model: String,
    gear: String,
    fuel: String,
    price: Number,

    image: String,
    about: String,
    features: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
