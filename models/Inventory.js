const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
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

    // ⭐ ADD THESE TWO FIELDS (IMPORTANT)
    rating: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    // ✅ APPROVAL SYSTEM
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);