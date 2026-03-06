const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true, // ✅ remove extra spaces
    },
  },
  { timestamps: true }
);

/* ✅ ONE USER = ONE REVIEW PER CAR */
reviewSchema.index(
  { user: 1, car: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);