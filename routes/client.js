const bcrypt = require("bcryptjs");
const Client = require("../models/clientschem");
const generateToken = require("../utils/jwt");

module.exports = (app) => {

  app.post("/api/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const exist = await Client.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const client = await Client.create({ name, email, password: hash });

    res.json({ token: generateToken(client._id) });
  });

  app.post("/api/clintlogin", async (req, res) => {
    const { email, password } = req.body;

    const client = await Client.findOne({ email });
    if (!client) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, client.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(client._id) });
  });

};
