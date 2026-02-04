const bcrypt = require("bcryptjs");
const User = require("../models/user");

module.exports = function (app) {
  /* REGISTER */
  app.post("/api/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const exist = await User.findOne({ email });
      if (exist) return res.status(400).json({ msg: "User already exists" });

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hash,
      });

      res.json({
        msg: "Registered successfully",
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* LOGIN */
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ msg: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ msg: "Wrong password" });

      res.json({
        msg: "Login success",
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
