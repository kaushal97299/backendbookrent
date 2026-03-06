const Client = require("../models/clientschem");
const adminProtect = require("../middleware/admin");

module.exports = (app) => {

  /* ================= GET ALL KYC ================= */

  app.get("/api/admin/kyc", adminProtect, async (req, res) => {
    try {

      const users = await Client.find({
        role: "client",
        kycStatus: { $in: ["pending", "verified", "rejected"] },
      })
        .select("-password")
        .sort({ createdAt: -1 });

      res.json(users);

    } catch (err) {

      console.error("KYC LIST ERROR:", err);

      res.status(500).json({
        message: "Failed to fetch KYC data",
      });
    }
  });


  /* ================= GET SINGLE USER ================= */

  app.get(
    "/api/admin/kyc/:id",
    adminProtect,
    async (req, res) => {
      try {

        const user = await Client.findById(req.params.id)
          .select("-password");

        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        res.json(user);

      } catch (err) {

        console.error("KYC SINGLE ERROR:", err);

        res.status(500).json({
          message: "Failed to fetch user",
        });
      }
    }
  );


  /* ================= UPDATE KYC STATUS ================= */

  app.put(
    "/api/admin/kyc/:id/status",
    adminProtect,
    async (req, res) => {
      try {

        const { status, reason } = req.body; // ✅ added reason

        if (!["verified", "rejected"].includes(status)) {
          return res.status(400).json({
            message: "Invalid status",
          });
        }

        const user = await Client.findById(req.params.id);

        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        /* ================= MAIN STATUS ================= */

        user.kycStatus = status;
        user.profileCompleted = status === "verified";

        /* ================= DOC STATUS SYNC ================= */

        if (user.documents) {

          if (user.documents.aadhaar)
            user.documents.aadhaar.status = status;

          if (user.documents.pan)
            user.documents.pan.status = status;

          if (user.documents.drivingLicense)
            user.documents.drivingLicense.status = status;
        }

        /* ================= REJECT REASON ================= */

        if (status === "rejected") {
          user.kycRejectReason = reason || "Not specified";
        } else {
          user.kycRejectReason = "";
        }

        await user.save();

        res.json({
          success: true,
          message: `KYC ${status}`,
          user,
        });

      } catch (err) {

        console.error("KYC UPDATE ERROR:", err);

        res.status(500).json({
          message: "Update failed",
        });
      }
    }
  );


  /* ================= DELETE USER ================= */

  app.delete(
    "/api/admin/kyc/:id",
    adminProtect,
    async (req, res) => {
      try {

        const user = await Client.findByIdAndDelete(
          req.params.id
        );

        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        res.json({
          success: true,
          message: "User deleted successfully",
        });

      } catch (err) {

        console.error("DELETE ERROR:", err);

        res.status(500).json({
          message: "Delete failed",
        });
      }
    }
  );

};
