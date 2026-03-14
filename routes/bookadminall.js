const Booking = require("../models/Booking");
const adminAuth = require("../middleware/admin");

module.exports = function(app){

app.get("/api/booking/all", adminAuth, async (req, res) => {

  try{

    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    res.json(bookings);

  }catch(err){

    console.log("Admin Booking Error:", err);
    res.status(500).json({ message: "Server error" });

  }

});

};