const jwt = require("jsonwebtoken");
const adminProtect = require("../middleware/admin"); // middleware

module.exports = (app) => {

  /* ================= ADMIN LOGIN ================= */

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const {
        ADMIN_EMAIL,
        ADMIN_PASSWORD,
        JWT_SECRET,
      } = process.env;

      // Validate admin
      if (
        email !== ADMIN_EMAIL ||
        password !== ADMIN_PASSWORD
      ) {
        return res
          .status(401)
          .json({ message: "Invalid credentials" });
      }

      // Generate JWT (role important)
      const token = jwt.sign(
        {
          role: "admin",
          email,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        success: true,
        token,
        message: "Login successful",
      });

    } catch (err) {
      console.error(err);

      return res
        .status(500)
        .json({ message: "Server error" });
    }
  });


  /* ================= FORGOT PASSWORD ================= */

  app.post("/api/admin/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const {
        ADMIN_EMAIL,
        RESET_SECRET,
      } = process.env;

      if (email !== ADMIN_EMAIL) {
        return res
          .status(404)
          .json({ message: "Email not found" });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { email },
        RESET_SECRET,
        { expiresIn: "15m" }
      );

      console.log(`
=================================
RESET LINK:

http://localhost:3000/admin/reset-password?token=${resetToken}
=================================
      `);

      return res.json({
        success: true,
        message: "Reset link sent",
      });

    } catch (err) {
      console.error(err);

      return res
        .status(500)
        .json({ message: "Server error" });
    }
  });

};
