const Review = require("../models/review");
const Inventory = require("../models/Inventory");
const userAuth = require("../middleware/userauth");
const mongoose = require("mongoose"); // ✅ IMPORTANT

module.exports = (app) => {

  /* ================= ADD REVIEW ================= */
  app.post("/api/review", userAuth, async (req, res) => {
    try {

      const { carId, rating, comment } = req.body;

      /* ✅ BASIC VALIDATION */
      if (!carId || !rating || !comment) {
        return res.status(400).json({
          success: false,
          message: "All fields required",
        });
      }

      /* ✅ VALID OBJECT ID */
      if (!mongoose.Types.ObjectId.isValid(carId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid car id",
        });
      }

      /* ✅ ONE USER = ONE REVIEW */
      const exists = await Review.findOne({
        user: req.user.id,
        car: carId,
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "You already reviewed this car",
        });
      }

      /* ✅ CREATE REVIEW */
      await Review.create({
        user: req.user.id,
        car: carId,
        rating: Number(rating),
        comment,
      });

      /* ✅ CALCULATE AVG + COUNT */
      const stats = await Review.aggregate([
        {
          $match: {
            car: new mongoose.Types.ObjectId(carId),
          },
        },
        {
          $group: {
            _id: "$car",
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      const avg =
        stats.length > 0
          ? Number(stats[0].avgRating.toFixed(1))
          : 0;

      const count =
        stats.length > 0
          ? stats[0].totalReviews
          : 0;

      /* ✅ UPDATE INVENTORY */
      const updatedCar = await Inventory.findByIdAndUpdate(
        carId,
        {
          $set: {
            rating: avg,
            reviews: count,
          },
        },
        { new: true }
      );

      if (!updatedCar) {
        return res.status(404).json({
          success: false,
          message: "Car not found",
        });
      }

      res.json({
        success: true,
        message: "Review added successfully",
        rating: avg,
        reviews: count,
      });

    } catch (err) {

      console.error("Review error:", err);

      res.status(500).json({
        success: false,
        message: "Review failed",
      });
    }
  });


  /* ================= GET REVIEWS ================= */
  app.get("/api/review/:carId", async (req, res) => {
    try {

      const reviews = await Review.find({
        car: req.params.carId,
      })
        .populate("user", "name")
        .sort({ createdAt: -1 });

      res.json(reviews);

    } catch (err) {

      console.error("Get reviews error:", err);

      res.status(500).json({
        success: false,
        message: "Failed to load reviews",
      });
    }
  });

};