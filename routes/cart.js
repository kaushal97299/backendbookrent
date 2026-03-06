const Cart = require("../models/cart");
const userAuth = require("../middleware/userauth");

module.exports = (app) => {

  /* ============ ADD TO CART ============ */
  app.post("/api/cart", userAuth, async (req, res) => {
    try {

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "Not logged in",
        });
      }

      const { carId } = req.body;

      if (!carId) {
        return res.status(400).json({
          success: false,
          message: "Car ID required",
        });
      }

      // ✅ Check already exists
      const exists = await Cart.findOne({
        user: req.user.id,
        car: carId,
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Already in cart",
        });
      }

      // ✅ Create new item
      const item = await Cart.create({
        user: req.user.id,
        car: carId,
      });

      res.status(201).json({
        success: true,
        message: "Added to cart",
        item,
      });

    } catch (err) {

      console.error("CART ADD ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Cart failed",
        error: err.message,
      });
    }
  });


  /* ============ GET MY CART ============ */
  app.get("/api/cart", userAuth, async (req, res) => {
    try {

      const cart = await Cart.find({
        user: req.user.id,
      }).populate("car");

      res.json(cart);

    } catch (err) {

      console.error("CART FETCH ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Fetch failed",
      });
    }
  });


  /* ============ REMOVE FROM CART ============ */
  app.delete("/api/cart/:id", userAuth, async (req, res) => {
    try {

      const deleted = await Cart.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      res.json({
        success: true,
        message: "Removed from cart",
      });

    } catch (err) {

      console.error("CART DELETE ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Delete failed",
      });
    }
  });


  /* ============ CART COUNT (SIDEBAR) ============ */
  app.get("/api/cart/count", userAuth, async (req, res) => {
    try {

      const count = await Cart.countDocuments({
        user: req.user.id,
      });

      res.json({ count });

    } catch (err) {

      console.error("CART COUNT ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Count failed",
      });
    }
  });

};