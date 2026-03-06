const bodyParser = require("body-parser");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");

module.exports = function(app) {

app.post("/api/booking/webhook",
  bodyParser.raw({ type: "application/json" }),

  async (req, res) => {

    const sig = req.headers["stripe-signature"];
    let event;

    try {

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

    } catch (err) {

      console.log("❌ Webhook Signature Failed");
      return res.status(400).send(`Webhook Error: ${err.message}`);

    }

    /* ================= PAYMENT SUCCESS ================= */

    if (event.type === "checkout.session.completed") {

      const session = event.data.object;

      const bookingId = session.metadata.bookingId;

      if (!bookingId) {
        console.log("⚠️ No bookingId found in metadata");
        return res.json({ received: true });
      }

      try {

        const booking = await Booking.findById(bookingId);

        if (!booking) {
          console.log("❌ Booking not found for webhook:", bookingId);
          return res.json({ received: true });
        }

        /* ⚠️ Prevent duplicate webhook updates */

        if (booking.paymentIntentId) {
          console.log("⚠️ Webhook already processed:", bookingId);
          return res.json({ received: true });
        }

        booking.paymentIntentId = session.payment_intent;
        booking.sessionId = session.id;

        // Payment done but admin still needs to accept
        booking.bookingStatus = "pending";

        // remove expiry hold
        booking.paymentExpiresAt = null;

        // trip lifecycle start state
        booking.tripStatus = "upcoming";

        await booking.save();

        console.log("✅ Booking payment confirmed:", booking._id);

      } catch (err) {

        console.log("Webhook DB Error:", err);

      }

    }

    res.json({ received: true });

  }
);

};