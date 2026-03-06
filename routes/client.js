const bcrypt = require("bcryptjs");
const Client = require("../models/clientschem");
const generateToken = require("../utils/jwt");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= UPLOAD DIR ================= */

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const AVATAR_DIR = path.join(UPLOAD_DIR, "avatars");
const KYC_DIR = path.join(UPLOAD_DIR, "kyc");

if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });
if (!fs.existsSync(KYC_DIR)) fs.mkdirSync(KYC_DIR, { recursive: true });

/* ================= MULTER ================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    if (file.fieldname === "avatar") cb(null, AVATAR_DIR);
    else cb(null, KYC_DIR);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },

});

const upload = multer({ storage });

/* ================= AUTH ================= */

const protect = async (req, res, next) => {

  try {

    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "client") {
      return res.status(403).json({ message: "Client only" });
    }

    const user = await Client.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account blocked" });
    }

    req.user = user;

    next();

  } catch (err) {

    console.log("AUTH ERROR:", err);

    res.status(401).json({ message: "Invalid token" });

  }
};


/* ================= ROUTES ================= */

module.exports = (app) => {


/* ================================================= */
/* ================= AUTH ========================== */
/* ================================================= */


/* ================= SIGNUP ================= */

app.post("/api/signup", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Min 8 char password" });
    }

    const exist = await Client.findOne({ email });

    if (exist) {
      return res.status(400).json({ message: "User exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await Client.create({
      name,
      email,
      password: hash,
    });

    const token = generateToken(user._id, "client");

    res.json({ success: true, token });

  } catch (err) {

    console.log("SIGNUP ERROR:", err);

    res.status(500).json({ message: "Signup failed" });

  }

});


/* ================= LOGIN ================= */

app.post("/api/clintlogin", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Required" });
    }

    const user = await Client.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, "client");

    res.json({ success: true, token });

  } catch (err) {

    console.log("LOGIN ERROR:", err);

    res.status(500).json({ message: "Login failed" });

  }

});


/* ================================================= */
/* ================= PROFILE ======================= */
/* ================================================= */


/* ================= CREATE PROFILE ================= */

app.post("/api/profile/create", protect, async (req, res) => {

  try {

    const user = await Client.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "Not found" });

    if (!user.documents) {

      user.documents = {
        aadhaar: {},
        pan: {},
        drivingLicense: {},
      };

      await user.save();
    }

    res.json({ success: true });

  } catch (err) {

    console.log("CREATE PROFILE ERROR:", err);

    res.status(500).json({ message: "Create failed" });

  }

});


/* ================= GET PROFILE ================= */

app.get("/api/profile/me", protect, async (req, res) => {

  try {

    const user = await Client.findById(req.user._id);

    res.json(user);

  } catch (err) {

    console.log("GET PROFILE ERROR:", err);

    res.status(500).json({ message: "Fetch failed" });

  }

});


/* ================= UPDATE PROFILE ================= */

/* ================= UPDATE PROFILE ================= */

app.put(
  "/api/profile/update",

  protect,

  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "aadhaarImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "dlImage", maxCount: 1 },
  ]),

  async (req, res) => {

    try {

      console.log("BODY =>", req.body);
      console.log("FILES =>", req.files);

      const user = await Client.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "Not found" });
      }


      /* ================= BASIC ================= */

      const fields = [
        "name",
        "phone",
        "address",
        "pincode",
        "city",
        "district",
        "state",
      ];

      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          user[f] = req.body[f];
        }
      });


      /* ================= DOB & GENDER (ADDED) ================= */

      // Date of Birth
      if (req.body.dob !== undefined) {
        if (req.body.dob === "") {
          user.dateOfBirth = null;
        } else {
          const parsedDate = new Date(req.body.dob);
          if (!isNaN(parsedDate.getTime())) {
            user.dateOfBirth = parsedDate;
          }
        }
      }

      // Gender
      if (req.body.gender !== undefined) {
        user.gender = req.body.gender;
      }


      /* ================= DOC NUMBERS ================= */

      if (req.body.aadhaarNumber)
        user.documents.aadhaar.number = req.body.aadhaarNumber;

      if (req.body.panNumber)
        user.documents.pan.number = req.body.panNumber;

      if (req.body.drivingLicenseNumber)
        user.documents.drivingLicense.number =
          req.body.drivingLicenseNumber;


      /* ================= FILES ================= */

      if (req.files?.avatar) {
        user.avatar =
          "/uploads/avatars/" + req.files.avatar[0].filename;
      }

      if (req.files?.aadhaarImage) {
        user.documents.aadhaar.image =
          "/uploads/kyc/" + req.files.aadhaarImage[0].filename;
      }

      if (req.files?.panImage) {
        user.documents.pan.image =
          "/uploads/kyc/" + req.files.panImage[0].filename;
      }

      if (req.files?.dlImage) {
        user.documents.drivingLicense.image =
          "/uploads/kyc/" + req.files.dlImage[0].filename;
      }


      /* ================= KYC ================= */

      if (
        user.documents.aadhaar.image &&
        user.documents.pan.image &&
        user.documents.drivingLicense.image
      ) {
        user.kycStatus = "pending";
      }


      user.profileCompleted = true;

      await user.save();

      res.json({
        success: true,
        message: "Profile Updated",
      });

    } catch (err) {

      console.log("UPDATE PROFILE ERROR:", err);

      res.status(500).json({ message: "Update failed" });

    }

  }
);

/* ================================================= */
/* ================= PINCODE ======================= */
/* ================================================= */

app.get("/api/pincode/:code", async (req, res) => {

  try {

    const { code } = req.params;

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Invalid" });
    }

    const response = await fetch(
      `https://api.postalpincode.in/pincode/${code}`
    );

    const data = await response.json();

    if (!data[0] || data[0].Status !== "Success") {
      return res.status(404).json({ message: "Not found" });
    }

    const postOffices = data[0].PostOffice;

    res.json({
      state: postOffices[0].State,
      district: postOffices[0].District,
      city: postOffices[0].Block,
      locations: postOffices.map(p => p.Name),
    });

  } catch (err) {

    console.log("PINCODE ERROR:", err);

    res.status(500).json({ message: "Failed" });

  }

});


};
