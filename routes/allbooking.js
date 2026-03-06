const Booking = require("../models/Booking");

module.exports = function(app) {

app.get("/api/booking/all", async (req, res) => {

  try {

    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    console.log("All Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }

});

};