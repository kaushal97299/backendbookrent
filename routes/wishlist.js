const Wishlist = require("../models/Wishlist");
const userAuth = require("../middleware/userauth");

module.exports = (app) => {

  /* ============ ADD TO WISHLIST ============ */
  app.post("/api/wishlist", userAuth, async (req, res) => {
    try {

      const { carId } = req.body;

      if (!carId) {
        return res.status(400).json({ message: "Car ID required" });
      }

      const exists = await Wishlist.findOne({
        user: req.user.id,
        car: carId,
      });

      if (exists) {
        return res.json({ message: "Already in wishlist" });
      }

      const item = await Wishlist.create({
        user: req.user.id,
        car: carId,
      });

      res.json(item);

    } catch (err) {
      console.error("WISHLIST ADD ERROR:", err);

      res.status(500).json({ message: "Add failed" });
    }
  });


  /* ============ GET MY WISHLIST ============ */
  app.get("/api/wishlist", userAuth, async (req, res) => {
    try {

      const list = await Wishlist.find({
        user: req.user.id,
      }).populate("car");

      res.json(list);

    } catch (err) {
      res.status(500).json({ message: "Fetch failed" });
    }
  });
  // COUNT WISHLIST
app.get("/api/wishlist/count", userAuth, async (req, res) => {
  try {

    const count = await Wishlist.countDocuments({
      user: req.user.id,
    });

    res.json({ count });

  } catch (err) {
    res.status(500).json({ message: "Count failed" });
  }
});


  /* ============ REMOVE WISHLIST ============ */
  app.delete("/api/wishlist/:id", userAuth, async (req, res) => {
    try {

      await Wishlist.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

      res.json({ success: true });

    } catch (err) {
      res.status(500).json({ message: "Delete failed" });
    }
  });

};