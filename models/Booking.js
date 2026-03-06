const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  userId: String,

  carId: String,
  name: String,

  days: Number,
  amount: Number,

  fullName: String,
  phone: String,
  email: String,
  licenseNo: String,

  address: String,
  pincode: String,
  city: String,
  state: String,
  village: String,

  pickupDate: String,
  pickupTime: String,
  dropDate: String,
  dropTime: String,

  paymentIntentId: String,
  sessionId: String,

  bookingStatus: {
    type: String,
    default: "pending"
  },

  /* ================= TRIP LIFECYCLE ================= */

  tripStatus: {
    type: String,
    default: "upcoming"
    // upcoming → active → completed
  },

  /* ================= AUTO EXPIRY ================= */

  paymentExpiresAt: Date,

  autoCancelled: {
    type: Boolean,
    default: false
  },

  /* ================= REMINDERS ================= */

  pickupReminderSent: {
    type: Boolean,
    default: false
  },

  /* ================= EXTENSION ================= */

  extended: {
    type: Boolean,
    default: false
  },

  /* ================= DRIVER ================= */

  driverRequired: {
    type: Boolean,
    default: false
  },

  driverCharge: {
    type: Number,
    default: 0
  },

  /* ================= CANCELLATION ================= */

  cancelledByUser: {
    type: Boolean,
    default: false
  },

  refundAmount: {
    type: Number,
    default: 0
  },

  /* ================= MANUAL BLOCK ================= */

  blockedManually: {
    type: Boolean,
    default: false
  },

  /* ================= NOTIFICATION ================= */

  notificationSent: {
    type: Boolean,
    default: false
  },

  isVisibleToUser: {
    type: Boolean,
    default: false
  },

  /* ================= INVOICES ================= */

  invoiceUrl: {
    type: String,
    default: ""
  },

  clientInvoiceUrl: {
    type: String,
    default: ""
  },

  acceptedAt: Date,
  rejectedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);