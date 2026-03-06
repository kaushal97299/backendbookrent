const User = require("../models/user");
const mongoose = require("mongoose");

module.exports = (app) => {

  /* ================= GET ALL USERS ================= */
  app.get("/api/admin/users", async (req, res) => {
    try {

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        users,
      });

    } catch (err) {

      console.error("GET USERS ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });


  /* ================= GET SINGLE USER (SECURE) ================= */
  app.get("/api/admin/user/:id", async (req, res) => {
    try {

      const { id } = req.params;

      // ✅ Validate Mongo ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }

      const user = await User.findById(id)
        .select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user,
      });

    } catch (err) {

      console.error("GET USER ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });


  /* ================= DELETE USER (SECURE) ================= */
  app.delete("/api/admin/user/:id", async (req, res) => {
    try {

      const { id } = req.params;

      // ✅ Validate Mongo ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await user.deleteOne();

      res.json({
        success: true,
        message: "User deleted successfully",
      });

    } catch (err) {

      console.error("DELETE USER ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });

};