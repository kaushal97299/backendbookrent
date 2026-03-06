const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    let token = null;

    /* ================= GET TOKEN ================= */

    // 1️⃣ From Header (Preferred)
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2️⃣ From Cookies (Optional - Future Use)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // ❌ No Token
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Access denied. Token missing.",
      });
    }

    /* ================= VERIFY ================= */

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ================= ROLE CHECK ================= */

    if (decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized. User access only.",
      });
    }

    /* ================= ATTACH USER ================= */

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    next();

  } catch (err) {
    console.error("JWT Error:", err.message);

    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token.",
    });
  }
};

module.exports = userAuth;