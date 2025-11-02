const jwt = require("jsonwebtoken");
const { NODE_ENV, SECRET_KEY } = require("../config/envVars");

const generateToken = (user, res) => {
  const token = jwt.sign(
    { userId: user._id, name: user.fullName, roles: user.roles },
    SECRET_KEY,
    { expiresIn: "1d" }
  );
  res.cookie("jwt-token", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Use "none" for localhost development
    maxAge: 864000000,
  });
  return token;
};

module.exports = generateToken;
