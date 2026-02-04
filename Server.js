const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Conifig/db");
const cors = require("cors");
const path = require("path");

dotenv.config(); // 👈 load .env

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

/* ================= STATIC (IMAGE UPLOAD) ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("Server running + DB connected");
});

require("./routes/auth")(app);
require("./routes/client")(app);
require("./routes/inventory")(app);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
