const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, roles: user.roles }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
};

module.exports = generateToken;
