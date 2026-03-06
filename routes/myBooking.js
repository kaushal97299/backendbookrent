const Booking = require("../models/Booking");
const userAuth = require("../middleware/userauth");

module.exports = function(app) {

app.get("/api/booking/my", userAuth, async (req, res) => {

  try {

    const bookings = await Booking.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    // 🔒 Hide payment details
   const safeBookings = bookings.map(b => ({
  _id: b._id,
  carId: b.carId,
  name: b.name,
  days: b.days,
  amount: b.amount,
  pickupDate: b.pickupDate,
  pickupTime: b.pickupTime,
  dropDate: b.dropDate,
  dropTime: b.dropTime,
  bookingStatus: b.bookingStatus,

  // 💳 Show Payment ID
  paymentId: b.paymentIntentId,

  createdAt: b.createdAt
}));

    res.json(safeBookings);

  } catch (err) {
    console.log("My Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }

});

};