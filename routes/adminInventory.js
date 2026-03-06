const Inventory = require("../models/Inventory");
const Client = require("../models/clientschem");
const adminProtect = require("../middleware/admin");

module.exports = (app) => {

  /* ===================================== */
  /* ===== GET ALL INVENTORY (ADMIN) ===== */
  /* ===================================== */
  app.get("/api/admin/inventory", adminProtect, async (req, res) => {
    try {
      const data = await Inventory.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.json(data);

    } catch (err) {
      console.error("ADMIN FETCH ERROR:", err);
      res.status(500).json({ message: "Fetch failed" });
    }
  });


  /* ===================================== */
  /* ========== SEARCH INVENTORY ========= */
  /* ===================================== */
  app.get("/api/admin/inventory/search", adminProtect, async (req, res) => {
    try {

      const { q } = req.query;

      if (!q) return res.json([]);

      // ✅ Step 1: Search users first
      const users = await Client.find({
        $or: [
          { email: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      // ✅ Step 2: Search inventory using user IDs
      const data = await Inventory.find({
        user: { $in: userIds },
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.json(data);

    } catch (err) {
      console.error("SEARCH ERROR:", err);
      res.status(500).json({ message: "Search failed" });
    }
  });


  /* ===================================== */
  /* ===== APPROVE / REJECT INVENTORY ===== */
  /* ===================================== */
  app.put("/api/admin/inventory/:id/status", adminProtect, async (req, res) => {
    try {

      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const item = await Inventory.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json(item);

    } catch (err) {
      console.error("ADMIN STATUS ERROR:", err);
      res.status(500).json({ message: "Update failed" });
    }
  });

};
