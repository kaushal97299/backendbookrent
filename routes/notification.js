const Notification = require("../models/Notification");
const userAuth = require("../middleware/userauth");

module.exports = function(app) {

/* ================= USER NOTIFICATIONS ================= */

app.get("/api/notifications", userAuth, async (req, res) => {

  try {

    const notifications = await Notification.find({
      userId: req.user.id
    })
    .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {
    console.log("Notification Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }

});


/* ================= MARK AS READ ================= */

app.patch("/api/notifications/read/:id", userAuth, async (req, res) => {

  try {

    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true }
    );

    res.json({ message: "Notification marked as read" });

  } catch (err) {
    console.log("Notification Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }

});

};