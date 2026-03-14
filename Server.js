const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Conifig/db");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

/* ================= WEBHOOK FIRST ================= */
app.use("/api/booking/webhook", express.raw({ type: "application/json" }));

require("./routes/bookingWebhook")(app);
require("./routes/bookingExpiry")

/* ================= CORS ================= */

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC ================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= ERROR HANDLING MIDDLEWARE ================= */

// ✅ ADD THIS - Handle payload too large errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      success: false, 
      msg: 'File too large. Maximum size is 50MB' 
    });
  }
  next(err);
});

/* ================= DB ================= */

connectDB();

/* ================= ROUTES ================= */

require("./routes/auth")(app);
require("./routes/client")(app);
require("./routes/inventory")(app);
require("./routes/admin")(app);
require("./routes/adminInventory")(app);
require("./routes/adminkyc")(app);
require("./routes/adminUser")(app);
require("./routes/cart")(app);
require("./routes/wishlist")(app);
require("./routes/Review")(app);
require("./routes/booking")(app);
require("./routes/bookingAction")(app);
require("./routes/myBooking")(app);
require("./routes/notification")(app);
require("./routes/invoice")(app);
require("./routes/allbooking")(app);
require("./routes/contact")(app);
require("./routes/help")(app);
require("./routes/claimRoutes")(app);
require("./routes/adminClaims")(app);

/* ================= START ================= */

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});