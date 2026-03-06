const Booking = require("../models/Booking");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Notification = require("../models/Notification");

module.exports = function(app) {

/* ================= ACCEPT BOOKING ================= */

app.patch("/api/booking/accept/:id", async (req, res) => {

  try {

    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const invoicesDir = path.join(__dirname, "../uploads/invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    /* ================= USER INVOICE ================= */

    const userInvoiceName = `invoice-user-${booking._id}.pdf`;
    const userInvoicePath = path.join(invoicesDir, userInvoiceName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(userInvoicePath));

    // HEADER
    doc.fontSize(22).text("CAR RENTAL INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(10)
      .text(`Invoice Date: ${new Date().toLocaleDateString()}`, { align: "right" })
      .text(`Booking ID: ${booking._id}`, { align: "right" })
      .text(`Payment ID: ${booking.paymentIntentId || "N/A"}`, { align: "right" });

    doc.moveDown(2);

    // CUSTOMER
    doc.fontSize(14).text("Customer Details", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12)
      .text(`Name: ${booking.fullName}`)
      .text(`Phone: ${booking.phone}`)
      .text(`Email: ${booking.email}`)
      .text(`License No: ${booking.licenseNo}`)
      .text(`Address: ${booking.address}, ${booking.village}`)
      .text(`${booking.city}, ${booking.state} - ${booking.pincode}`);

    doc.moveDown(2);

    // CAR
    doc.fontSize(14).text("Car Details", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12)
      .text(`Car: ${booking.name}`);

    doc.moveDown(2);

    // BOOKING
    doc.fontSize(14).text("Booking Details", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12)
      .text(`Pickup: ${booking.pickupDate} ${booking.pickupTime}`)
      .text(`Drop: ${booking.dropDate} ${booking.dropTime}`)
      .text(`Total Days: ${booking.days}`);

    doc.moveDown(2);

    // PAYMENT
    doc.fontSize(14).text("Payment Summary", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12)
      .text(`Amount Paid: ₹${booking.amount}`)
      .text(`Status: ACCEPTED`);

    doc.moveDown(3);

    doc.text("Authorized Signature", { align: "right" });
    doc.text("CarBooking Pvt Ltd", { align: "right" });

    doc.end();


    /* ================= CLIENT INVOICE ================= */

    const clientInvoiceName = `invoice-client-${booking._id}.pdf`;
    const clientInvoicePath = path.join(invoicesDir, clientInvoiceName);

    const docClient = new PDFDocument({ margin: 50 });
    docClient.pipe(fs.createWriteStream(clientInvoicePath));

    docClient.fontSize(22).text("BOOKING ORDER RECEIPT", { align: "center" });
    docClient.moveDown();

    docClient.fontSize(10)
      .text(`Order Date: ${new Date().toLocaleDateString()}`, { align: "right" })
      .text(`Booking ID: ${booking._id}`, { align: "right" })
      .text(`Payment ID: ${booking.paymentIntentId || "N/A"}`, { align: "right" });

    docClient.moveDown(2);

    docClient.fontSize(14).text("Customer Info", { underline: true });
    docClient.moveDown(0.5);

    docClient.fontSize(12)
      .text(`Name: ${booking.fullName}`)
      .text(`Phone: ${booking.phone}`)
      .text(`Email: ${booking.email}`);

    docClient.moveDown(2);

    docClient.fontSize(14).text("Rental Info", { underline: true });
    docClient.moveDown(0.5);

    docClient.fontSize(12)
      .text(`Car: ${booking.name}`)
      .text(`Pickup: ${booking.pickupDate} ${booking.pickupTime}`)
      .text(`Drop: ${booking.dropDate} ${booking.dropTime}`)
      .text(`Days: ${booking.days}`)
      .text(`Total Paid: ₹${booking.amount}`);

    docClient.moveDown(3);

    docClient.text("Internal Order Copy", { align: "center" });
    docClient.end();


    /* ================= UPDATE BOOKING ================= */

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "accepted",
        notificationSent: true,
        isVisibleToUser: true,
        acceptedAt: new Date(),
        invoiceUrl: `/uploads/invoices/${userInvoiceName}`,
        clientInvoiceUrl: `/uploads/invoices/${clientInvoiceName}`
      },
      { new: true }
    );

    /* 🔔 NOTIFICATION */

    if (booking.userId) {
      await Notification.create({
        userId: booking.userId,
        title: "Booking Accepted",
        message: `Your booking for ${booking.name} has been accepted.`,
        type: "booking"
      });
    }

    res.json({
      message: "Booking accepted & both invoices generated",
      booking: updatedBooking
    });

  } catch (err) {
    console.log("Accept Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }

});

/* ================= DOWNLOAD INVOICE ================= */

app.get("/api/booking/invoice/:id", async (req, res) => {

  const type = req.query.type || "user";

  const booking = await Booking.findById(req.params.id);

  if (!booking) return res.status(404).send("Not found");

  const fileUrl =
    type === "client"
      ? booking.clientInvoiceUrl
      : booking.invoiceUrl;

  if (!fileUrl) return res.status(404).send("Invoice missing");

  const filePath = path.join(__dirname, "..", fileUrl);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File missing");
  }

  res.download(filePath);
});


/* ================= REJECT BOOKING ================= */

app.patch("/api/booking/reject/:id", async (req, res) => {

  try {

    const bookingId = req.params.id;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "rejected",
        rejectedAt: new Date(),
        notificationSent: true,
        isVisibleToUser: true
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    /* 🔔 CREATE NOTIFICATION */

    if (updatedBooking.userId) {
      await Notification.create({
        userId: updatedBooking.userId,
        title: "Booking Rejected",
        message: `Your booking for ${updatedBooking.name} has been rejected.`,
        type: "booking"
      });
    }

    res.json({
      message: "Booking rejected",
      booking: updatedBooking
    });

  } catch (err) {
    console.log("Reject Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }

});

};