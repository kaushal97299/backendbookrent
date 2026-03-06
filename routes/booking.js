const Stripe = require("stripe");
const userAuth = require("../middleware/userauth");
const Booking = require("../models/Booking");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = function(app) {

  /* ================= PINCODE API ================= */

  app.get("/api/booking/pincode/:pin", async (req, res) => {

    try {

      const pin = req.params.pin;

      if (!pin || pin.length !== 6) {
        return res.status(400).json({ error: "Invalid pincode" });
      }

      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();

      if (
        !data ||
        !Array.isArray(data) ||
        !data[0] ||
        data[0].Status !== "Success" ||
        !data[0].PostOffice
      ) {
        return res.status(400).json({ error: "Pincode not found" });
      }

      const postOffices = data[0].PostOffice;

      const city = postOffices[0]?.District || "";
      const state = postOffices[0]?.State || "";

      const mergedSet = new Set();

      postOffices.forEach(po => {
        if (po?.Block) mergedSet.add(po.Block);
        if (po?.Name) mergedSet.add(po.Name);
      });

      const villages = Array.from(mergedSet).sort();

      res.json({ city, state, villages });

    } catch (err) {
      console.log("PINCODE ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }

  });

  /* ================= UNAVAILABLE DATES API ================= */

  app.get("/api/booking/unavailable/:carId", async (req,res)=>{

    try {

      const carId = req.params.carId;
      const now = new Date();

      const bookings = await Booking.find({
        carId,
        $or: [
          { bookingStatus: "accepted" },
          {
            bookingStatus: "pending",
            paymentExpiresAt: { $gt: now }
          },
          {
            bookingStatus: "pending",
            paymentExpiresAt: null
          }
        ]
      });

      const ranges = bookings.map(b => ({
        from: b.pickupDate,
        to: b.dropDate
      }));

      res.json(ranges);

    } catch (err) {

      console.log("Availability Error:", err);
      res.status(500).json({ message:"Server error" });

    }

  });

  /* ================= CREATE BOOKING ================= */

  app.post("/api/booking/create", userAuth, async (req, res) => {

    console.log("BOOKING DATA:", req.body);
    console.log("USER FROM TOKEN:", req.user);

    try {

      const bookingData = {
        ...req.body,
        userId: req.user.id
      };

      const origin = req.headers.origin;

      /* ✅ CONVERT DATE STRING → DATE OBJECT */

      const pickupDate = new Date(bookingData.pickupDate);
      const dropDate = new Date(bookingData.dropDate);

      pickupDate.setHours(0,0,0,0);
      dropDate.setHours(0,0,0,0);

      /* 🚫 CHECK IF CAR ALREADY BOOKED */

      const overlap = await Booking.findOne({
        carId: bookingData.carId,
        pickupDate: { $lte: dropDate },
        dropDate: { $gte: pickupDate },
        bookingStatus: { $in: ["pending","accepted"] }
      });

      if (overlap) {
        return res.status(400).json({
          message: "Car already booked between selected dates"
        });
      }

      /* ⏳ PAYMENT EXPIRY 10 MIN */

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      /* 💾 CREATE TEMP BOOKING */

      const tempBooking = await Booking.create({

        ...bookingData,

        pickupDate,
        dropDate,

        bookingStatus: "pending",
        paymentExpiresAt: expiresAt

      });

      /* ================= STRIPE SESSION ================= */

      const session = await stripe.checkout.sessions.create({

        payment_method_types: ["card"],

        line_items: [{
          price_data: {
            currency: "inr",
            product_data: { name: bookingData.name },
            unit_amount: Math.round(Number(bookingData.amount) * 100)
          },
          quantity: 1
        }],

        mode: "payment",

        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment-cancel`,

        metadata: {
          bookingId: tempBooking._id.toString()
        }

      });

      tempBooking.sessionId = session.id;

      await tempBooking.save();

      res.json({ checkoutUrl: session.url });

    } catch (err) {

      console.log("Stripe Error:", err);

      res.status(500).json({
        error: err.message
      });

    }

  });

};