const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Booking = require("../models/Booking");

module.exports = function(app) {

/* ================= GENERATE INVOICE ================= */

app.get("/api/booking/invoice/:id", async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const invoiceDir = path.join(__dirname, "../uploads/invoices");

    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const filePath = path.join(invoiceDir, `invoice-${booking._id}.pdf`);

    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(22).text("Car Booking Invoice", { align: "center" });

    doc.moveDown();

    doc.fontSize(14).text(`Customer: ${booking.fullName}`);
    doc.text(`Car: ${booking.name}`);
    doc.text(`Days: ${booking.days}`);
    doc.text(`Amount: ₹${booking.amount}`);

    doc.moveDown();

    doc.text(`Pickup: ${booking.pickupDate} ${booking.pickupTime}`);
    doc.text(`Drop: ${booking.dropDate} ${booking.dropTime}`);

    doc.moveDown();

    doc.text(`Address: ${booking.address}`);
    doc.text(`Village: ${booking.village}`);
    doc.text(`City: ${booking.city}`);
    doc.text(`State: ${booking.state}`);
    doc.text(`Pincode: ${booking.pincode}`);

    doc.moveDown();

    doc.text(`Status: ${booking.bookingStatus}`);

    doc.end();

    res.download(filePath);

  } catch (err) {
    console.log("Invoice Error:", err);
    res.status(500).json({ message: "Server error" });
  }

});

};