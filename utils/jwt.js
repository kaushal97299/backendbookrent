const jwt = require("jsonwebtoken");

const generateToken = (user, role = "user") => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,

      // dynamic role
      role,
      type: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;