const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("../models/user");
const generateToken = require("../utils/jwt");
const userAuth = require("../middleware/userauth"); // middleware

module.exports = function (app) {

  /* ================= REGISTER ================= */
  app.post("/api/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ msg: "All fields required" });
      }

      const exist = await User.findOne({ email });
      if (exist) {
        return res.status(400).json({ msg: "User already exists" });
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hash,
        role: "user",
      });

      // ✅ Generate USER token
      const token = generateToken(user, "user");

      res.status(201).json({
        msg: "Registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: "user",
        },
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });


  /* ================= LOGIN ================= */
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ msg: "All fields required" });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(400).json({ msg: "Wrong password" });
      }

      // ✅ Generate USER token
      const token = generateToken(user, "user");

      res.json({
        msg: "Login success",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: "user",
        },
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });


  /* ================= GET PROFILE ================= */
  app.get("/api/profile", userAuth, async (req, res) => {
    try {

      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      res.json({
        success: true,
        user,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });


  /* ================= UPDATE PROFILE ================= */
 /* ================= UPDATE PROFILE ================= */
app.put("/api/profile", userAuth, async (req, res) => {
  try {

    const {
      name,
      phone,
      bio,
      emergency,
      village,
      district,
      state,
      pincode,
      avatar,
      dob,
      gender,
      address,   // ✅ ADD THIS
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        bio,
        emergency,
        village,
        district,
        state,
        pincode,
        avatar,
        dob,
        gender,
        address, // ✅ SAVE THIS
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      msg: "Profile updated successfully",
      user: updated,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


  /* ================= PINCODE LOOKUP ================= */
  app.get("/api/pincode/:pin", userAuth, async (req, res) => {
    try {

      const { pin } = req.params;

      // ✅ Validate
      if (!/^[0-9]{6}$/.test(pin)) {
        return res.status(400).json({ msg: "Invalid pincode" });
      }

      // ✅ India Post API
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pin}`
      );

      const data = response.data;

      if (
        !data ||
        data[0].Status !== "Success" ||
        !data[0].PostOffice?.length
      ) {
        return res.status(404).json({ msg: "Pincode not found" });
      }

      // ✅ SEND ALL VILLAGES / TOWNS
      const addressList = data[0].PostOffice.map((post) => ({
        village: post.Name,
        district: post.District,
        state: post.State,
        block: post.Block,
        country: post.Country,
      }));

      res.json({
        success: true,
        addressList, // 🔥 FRONTEND DROPDOWN DATA
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

};