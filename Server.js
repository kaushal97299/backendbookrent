const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Conifig/db");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {

      // Postman / server request allow
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }

    },
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC ================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= DB ================= */

connectDB();

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("Server running + DB connected");
});

/* ================= ROUTES ================= */

require("./routes/auth")(app);
require("./routes/client")(app);
require("./routes/inventory")(app);
require("./routes/admin")(app);
require("./routes/adminInventory")(app);

/* ================= START ================= */

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
