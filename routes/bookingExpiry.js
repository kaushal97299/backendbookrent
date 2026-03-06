const Booking = require("../models/Booking");

module.exports = function(app) {

  console.log("⏳ Booking expiry watcher started...");

  setInterval(async () => {

    try {

      const now = new Date();

      const expiredBookings = await Booking.find({
        bookingStatus: "pending",
        paymentExpiresAt: { $lte: now },
        autoCancelled: false
      });

      if (expiredBookings.length === 0) return;

      for (let booking of expiredBookings) {

        booking.bookingStatus = "cancelled";
        booking.autoCancelled = true;
        booking.paymentExpiresAt = null;
        booking.rejectedAt = new Date(); // treat as rejected

        await booking.save();

        console.log("⛔ Auto cancelled booking:", booking._id);

      }

    } catch (err) {
      console.log("Auto cancel error:", err);
    }

  }, 60000); // every 1 minute
};