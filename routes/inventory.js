const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Inventory = require("../models/Inventory");
const protect = require("../middleware/auth");

module.exports = (app) => {
  /* ================= UPLOAD DIR ================= */
  const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  /* ================= MULTER ================= */
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "_");
      cb(null, Date.now() + "-" + safeName);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
        return cb(new Error("Only images allowed"));
      }
      cb(null, true);
    },
  });

  /* ================================================= */
  /* ================= ADD INVENTORY ================= */
  /* ================================================= */
  app.post(
    "/api/inventory",
    protect,
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Not authenticated" });
        }

        if (!req.body.price || isNaN(Number(req.body.price))) {
          return res.status(400).json({ message: "Invalid price" });
        }

        const car = await Inventory.create({
          user: req.user._id,
          name: req.body.name,
          brand: req.body.brand,
          model: req.body.model,
          gear: req.body.gear,
          fuel: req.body.fuel,
          price: Number(req.body.price),
          about: req.body.about,
          features: JSON.parse(req.body.features || "[]"),
          image: req.file ? `/uploads/${req.file.filename}` : "",
        });

        res.json(car);
      } catch (err) {
        console.error("ADD INVENTORY ERROR:", err);
        res.status(500).json({ message: "Failed to add inventory" });
      }
    }
  );

  /* ================================================= */
  /* ================= GET MY INVENTORY ============== */
  /* ================================================= */
  app.get("/api/inventory/my", protect, async (req, res) => {
    try {
      const data = await Inventory.find({
        user: req.user._id,
      }).sort({ createdAt: -1 });

      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Fetch failed" });
    }
  });

  /* ================================================= */
  /* ================= DELETE INVENTORY ============== */
  /* ================================================= */
  app.delete("/api/inventory/:id", protect, async (req, res) => {
    try {
      const inventory = await Inventory.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!inventory) {
        return res.status(404).json({ message: "Not found" });
      }

      // delete image file
      if (inventory.image) {
        const imgPath = path.join(__dirname, "..", inventory.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await inventory.deleteOne();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Delete failed" });
    }
  });

  /* ================================================= */
  /* ============ UPDATE SINGLE FIELD (PATCH) ======== */
  /* ================================================= */
  app.patch("/api/inventory/:id", protect, async (req, res) => {
    try {
      const { field, value } = req.body;

      if (!field) {
        return res.status(400).json({ message: "Field required" });
      }

      const inventory = await Inventory.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!inventory) {
        return res.status(404).json({ message: "Not found" });
      }

      // special handling
      if (field === "price") {
        inventory.price = Number(value);
      } else if (field === "features") {
        inventory.features = Array.isArray(value) ? value : [];
      } else {
        inventory[field] = value;
      }

      await inventory.save();
      res.json(inventory);
    } catch (err) {
      console.error("UPDATE FIELD ERROR:", err);
      res.status(500).json({ message: "Update failed" });
    }
  });

  /* ================================================= */
  /* ============== UPDATE IMAGE ONLY (PATCH) ======== */
  /* ================================================= */
  app.patch(
    "/api/inventory/:id/image",
    protect,
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "Image required" });
        }

        const inventory = await Inventory.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

        if (!inventory) {
          return res.status(404).json({ message: "Not found" });
        }

        // remove old image
        if (inventory.image) {
          const oldPath = path.join(__dirname, "..", inventory.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        inventory.image = `/uploads/${req.file.filename}`;
        await inventory.save();

        res.json(inventory);
      } catch (err) {
        console.error("IMAGE UPDATE ERROR:", err);
        res.status(500).json({ message: "Image update failed" });
      }
    }
  );
};
